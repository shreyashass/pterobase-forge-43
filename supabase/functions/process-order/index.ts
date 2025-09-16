// Update the order processing to only create servers for approved payments
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    
    // Get user from JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const body = await req.json()
    
    // Handle payment approval workflow
    if (body.approve_payment && body.order_id) {
      console.log('Processing payment approval for order:', body.order_id)
      
      // Get the order details
      const { data: order, error: orderError } = await supabaseClient
        .from('server_orders')
        .select('*, plans(*)')
        .eq('id', body.order_id)
        .single()

      if (orderError || !order) {
        console.error('Order fetch error:', orderError)
        return new Response(
          JSON.stringify({ error: 'Order not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Create server via Pterodactyl API
      try {
        const pterodactylResult = await createPterodactylServer(order, order.server_name)
        
        // Update order with Pterodactyl server ID and set status to active
        const { error: updateError } = await supabaseClient
          .from('server_orders')
          .update({
            pterodactyl_server_id: pterodactylResult.server_id,
            status: 'active',
            payment_status: 'approved'
          })
          .eq('id', order.id)

        if (updateError) {
          console.error('Error updating order:', updateError)
        }

        console.log('Server created successfully, ID:', pterodactylResult.server_id)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            server_id: pterodactylResult.server_id,
            message: 'Server created and activated successfully'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
        
      } catch (pteroError) {
        console.error('Pterodactyl API error:', pteroError)
        
        // Update order status to failed
        await supabaseClient
          .from('server_orders')
          .update({ status: 'failed' })
          .eq('id', order.id)

        return new Response(
          JSON.stringify({ 
            error: 'Server creation failed',
            order_id: order.id,
            message: 'Payment approved but server deployment failed'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Original order creation logic (without auto server creation)
    const { plan_id, server_name } = body
    
    if (!plan_id || !server_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: plan_id, server_name' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Creating order for user:', user.id, 'Plan:', plan_id, 'Server:', server_name)

    // Create the server order in database (without auto server creation)
    const { data: order, error: orderError } = await supabaseClient
      .from('server_orders')
      .insert({
        user_id: user.id,
        plan_id: plan_id,
        server_name: server_name,
        status: 'pending',
        payment_status: 'pending' // Wait for payment approval
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Order created:', order.id, '- Waiting for payment approval')

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: order.id,
        message: 'Order created successfully - Please complete payment for server activation'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/**
 * Placeholder function to create server via Pterodactyl API
 * This should be replaced with actual Pterodactyl API integration
 */
async function createPterodactylServer(order: any, serverName: string) {
  console.log('Creating Pterodactyl server for order:', order.id)
  
  const PTERO_API_KEY = Deno.env.get('PTERO_API_KEY')
  const PTERO_PANEL_URL = Deno.env.get('PTERO_PANEL_URL')
  
  if (!PTERO_API_KEY || !PTERO_PANEL_URL) {
    console.warn('Pterodactyl credentials not configured. Using mock server creation.')
    // Return mock server ID for development
    return {
      server_id: Math.floor(Math.random() * 10000) + 1000
    }
  }

  // TODO: Implement actual Pterodactyl API integration
  // Example implementation would be:
  /*
  const response = await fetch(`${PTERO_PANEL_URL}/api/application/servers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PTERO_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      name: serverName,
      user: order.user_id,
      egg: 1, // Egg ID for the server type
      docker_image: 'quay.io/pterodactyl/core:java',
      startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
      environment: {
        SERVER_JARFILE: 'server.jar',
        VANILLA_VERSION: 'latest'
      },
      limits: {
        memory: order.plans.memory, // Based on plan
        swap: 0,
        disk: order.plans.disk * 1024, // Convert GB to MB
        io: 500,
        cpu: order.plans.cpu // Based on plan
      },
      feature_limits: {
        databases: 1,
        allocations: 1,
        backups: 1
      },
      allocation: {
        default: 25565
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Pterodactyl API error: ${response.status}`)
  }

  const result = await response.json()
  return {
    server_id: result.attributes.id
  }
  */

  // For now, return a mock server ID
  console.log('Mock server created for development')
  return {
    server_id: Math.floor(Math.random() * 10000) + 1000
  }
}