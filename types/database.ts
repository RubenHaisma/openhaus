export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          password_hash: string
          role: 'buyer' | 'seller' | 'admin'
          verified: boolean
          failed_login_attempts: number
          locked_until: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      orders: {
        Row: {
          id: string
          order_number: string
          buyer_id: string
          seller_id: string
          property_id: string
          amount: number
          currency: string
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_method: string
          payment_intent_id: string | null
          shipping_address: any
          tracking_number: string | null
          notes: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      offers: {
        Row: {
          id: string
          property_id: string
          buyer_id: string
          seller_id: string
          amount: number
          currency: string
          status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired'
          message: string | null
          counter_amount: number | null
          counter_message: string | null
          rejection_message: string | null
          conditions: string[]
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['offers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['offers']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewee_id: string
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          verified_purchase: boolean
          helpful_votes: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      verification_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          type: 'email_verification' | 'password_reset' | 'phone_verification'
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['verification_tokens']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['verification_tokens']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_values: any | null
          new_values: any | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
      properties: {
        Row: {
          id: string
          address: string
          postal_code: string
          city: string
          province: string
          property_type: 'house' | 'apartment' | 'townhouse'
          bedrooms: number
          bathrooms: number
          square_meters: number
          construction_year: number
          asking_price: number
          estimated_value: number
          confidence_score: number
          status: 'available' | 'sold' | 'pending'
          images: string[]
          description: string
          features: string[]
          energy_label: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      valuations: {
        Row: {
          id: string
          user_id: string
          address: string
          postal_code: string
          city: string
          estimated_value: number
          confidence_score: number
          property_details: any
          comparable_sales: any[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['valuations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['valuations']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          buyer_id: string
          seller_id: string
          property_id: string
          purchase_price: number
          status: 'pending' | 'inspection_scheduled' | 'notary_appointed' | 'completed' | 'cancelled'
          notary_id?: string
          inspection_date?: string
          signing_date?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      notaries: {
        Row: {
          id: string
          name: string
          firm_name: string
          address: string
          city: string
          phone: string
          email: string
          specialties: string[]
          rating: number
          available_slots: any[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notaries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notaries']['Insert']>
      }
      mortgage_applications: {
        Row: {
          id: string
          user_id: string
          property_id?: string
          loan_amount: number
          income: number
          employment_type: string
          status: 'draft' | 'submitted' | 'approved' | 'rejected'
          documents: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['mortgage_applications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['mortgage_applications']['Insert']>
      }
    }
  }
}