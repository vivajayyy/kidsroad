import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase' // 방금 생성한 타입 불러오기

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Generic으로 Database 타입을 전달합니다.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)