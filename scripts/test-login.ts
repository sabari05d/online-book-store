import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.error('Missing environment variables.')
    process.exit(1)
}

async function testLogin() {
    console.log('Testing Admin Login...')

    // 1. Check if user exists using Service Role
    const adminClient = createClient(supabaseUrl!, supabaseServiceKey!)
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers()

    if (listError) {
        console.error('Error listing users:', listError)
        return
    }

    const adminUser = users.find(u => u.email === 'admin@example.com')
    if (!adminUser) {
        console.error('❌ Admin user DOES NOT exist in auth.users.')
        console.log('Please run: npx tsx scripts/seed.ts')
    } else {
        console.log('✅ Admin user exists in auth.users.')
        console.log('   ID:', adminUser.id)
        console.log('   Confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No')

        // Check profile
        const { data: profile, error: profileError } = await adminClient
            .from('profiles')
            .select('*')
            .eq('id', adminUser.id)
            .single()

        if (profileError || !profile) {
            console.error('❌ Admin profile missing or error:', profileError)
        } else {
            console.log('✅ Admin profile exists.')
            console.log('   Is Admin:', profile.is_admin)
        }
    }

    // 2. Try to login using Anon Key (simulate frontend)
    console.log('\nAttempting login with password...')
    const client = createClient(supabaseUrl!, supabaseAnonKey!)
    const { data, error } = await client.auth.signInWithPassword({
        email: 'admin@example.com',
        password: 'password123'
    })

    if (error) {
        console.error('❌ Login failed:', error.message)
    } else {
        console.log('✅ Login successful!')
        console.log('   Session User:', data.user.email)
    }
}

testLogin().catch(console.error)
