export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
        }
      }
      cast_members: {
        Row: {
          id: string
          character: string
          content_id: string
          person_id: string
        }
        Insert: {
          id?: string
          character: string
          content_id: string
          person_id: string
        }
        Update: {
          id?: string
          character?: string
          content_id?: string
          person_id?: string
        }
      }
      content: {
        Row: {
          id: string
          title: string
          description: string | null
          type: string
          poster_url: string | null
          backdrop_url: string | null
          trailer_url: string | null
          release_year: number | null
          duration: number | null
          maturity_rating: string | null
          featured: boolean
          trending: boolean
          popular: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: string
          poster_url?: string | null
          backdrop_url?: string | null
          trailer_url?: string | null
          release_year?: number | null
          duration?: number | null
          maturity_rating?: string | null
          featured?: boolean
          trending?: boolean
          popular?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: string
          poster_url?: string | null
          backdrop_url?: string | null
          trailer_url?: string | null
          release_year?: number | null
          duration?: number | null
          maturity_rating?: string | null
          featured?: boolean
          trending?: boolean
          popular?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      content_genres: {
        Row: {
          content_id: string
          genre_id: string
        }
        Insert: {
          content_id: string
          genre_id: string
        }
        Update: {
          content_id?: string
          genre_id?: string
        }
      }
      content_languages: {
        Row: {
          content_id: string
          language_id: string
        }
        Insert: {
          content_id: string
          language_id: string
        }
        Update: {
          content_id?: string
          language_id?: string
        }
      }
      crew: {
        Row: {
          id: string
          role: string
          content_id: string
          person_id: string
        }
        Insert: {
          id?: string
          role: string
          content_id: string
          person_id: string
        }
        Update: {
          id?: string
          role?: string
          content_id?: string
          person_id?: string
        }
      }
      episodes: {
        Row: {
          id: string
          number: number
          title: string
          description: string | null
          duration: number | null
          thumbnail_url: string | null
          video_url: string | null
          release_date: string | null
          season_id: string
        }
        Insert: {
          id?: string
          number: number
          title: string
          description?: string | null
          duration?: number | null
          thumbnail_url?: string | null
          video_url?: string | null
          release_date?: string | null
          season_id: string
        }
        Update: {
          id?: string
          number?: number
          title?: string
          description?: string | null
          duration?: number | null
          thumbnail_url?: string | null
          video_url?: string | null
          release_date?: string | null
          season_id?: string
        }
      }
      genres: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      languages: {
        Row: {
          id: string
          name: string
          code: string
        }
        Insert: {
          id?: string
          name: string
          code: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
        }
      }
      people: {
        Row: {
          id: string
          name: string
          biography: string | null
          image_url: string | null
          birth_date: string | null
        }
        Insert: {
          id?: string
          name: string
          biography?: string | null
          image_url?: string | null
          birth_date?: string | null
        }
        Update: {
          id?: string
          name?: string
          biography?: string | null
          image_url?: string | null
          birth_date?: string | null
        }
      }
      related_content: {
        Row: {
          content_id: string
          related_content_id: string
        }
        Insert: {
          content_id: string
          related_content_id: string
        }
        Update: {
          content_id?: string
          related_content_id?: string
        }
      }
      seasons: {
        Row: {
          id: string
          number: number
          title: string | null
          overview: string | null
          poster_url: string | null
          release_year: number | null
          content_id: string
        }
        Insert: {
          id?: string
          number: number
          title?: string | null
          overview?: string | null
          poster_url?: string | null
          release_year?: number | null
          content_id: string
        }
        Update: {
          id?: string
          number?: number
          title?: string | null
          overview?: string | null
          poster_url?: string | null
          release_year?: number | null
          content_id?: string
        }
      }
      sessions: {
        Row: {
          id: string
          session_token: string
          user_id: string
          expires: string
        }
        Insert: {
          id?: string
          session_token: string
          user_id: string
          expires: string
        }
        Update: {
          id?: string
          session_token?: string
          user_id?: string
          expires?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          features: string[]
          is_popular: boolean
          stripe_price_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          features: string[]
          is_popular?: boolean
          stripe_price_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          features?: string[]
          is_popular?: boolean
          stripe_price_id?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          stripe_subscription_id: string | null
          status: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          stripe_subscription_id?: string | null
          status: string
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          stripe_subscription_id?: string | null
          status?: string
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_content: {
        Row: {
          id: string
          user_id: string
          content_id: string
          added_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          added_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          added_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          email_verified: string | null
          image: string | null
          hashed_password: string | null
          created_at: string
          updated_at: string
          role: string
          subscription_status: string
          subscription_plan_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          email_verified?: string | null
          image?: string | null
          hashed_password?: string | null
          created_at?: string
          updated_at?: string
          role?: string
          subscription_status?: string
          subscription_plan_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          email_verified?: string | null
          image?: string | null
          hashed_password?: string | null
          created_at?: string
          updated_at?: string
          role?: string
          subscription_status?: string
          subscription_plan_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
      }
      verification_tokens: {
        Row: {
          identifier: string
          token: string
          expires: string
        }
        Insert: {
          identifier: string
          token: string
          expires: string
        }
        Update: {
          identifier?: string
          token?: string
          expires?: string
        }
      }
      watch_history: {
        Row: {
          id: string
          user_id: string
          content_id: string
          progress: number
          watched_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          progress: number
          watched_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          progress?: number
          watched_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
