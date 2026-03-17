export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          user_email: string
          user_id: string
        }
        Insert: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          user_email?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      billboards: {
        Row: {
          address: string | null
          area: number | null
          audience_profile: string | null
          city: string
          code: string
          cost: number | null
          created_at: string
          description: string | null
          dimension: string | null
          direction: string | null
          estimated_flow: number | null
          formats: string[] | null
          id: string
          land_owner: string | null
          land_owner_id: string | null
          lat: number
          lng: number
          photos: string[] | null
          price: number | null
          production_cost: number | null
          region: string
          route: string
          seasonality: string | null
          status: string
          traffic_type: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          area?: number | null
          audience_profile?: string | null
          city?: string
          code: string
          cost?: number | null
          created_at?: string
          description?: string | null
          dimension?: string | null
          direction?: string | null
          estimated_flow?: number | null
          formats?: string[] | null
          id?: string
          land_owner?: string | null
          land_owner_id?: string | null
          lat: number
          lng: number
          photos?: string[] | null
          price?: number | null
          production_cost?: number | null
          region?: string
          route?: string
          seasonality?: string | null
          status?: string
          traffic_type?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          area?: number | null
          audience_profile?: string | null
          city?: string
          code?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          dimension?: string | null
          direction?: string | null
          estimated_flow?: number | null
          formats?: string[] | null
          id?: string
          land_owner?: string | null
          land_owner_id?: string | null
          lat?: number
          lng?: number
          photos?: string[] | null
          price?: number | null
          production_cost?: number | null
          region?: string
          route?: string
          seasonality?: string | null
          status?: string
          traffic_type?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          billboard_ids: string[] | null
          company: string | null
          contract_ids: string[] | null
          created_at: string
          document: string | null
          email: string | null
          history: string[] | null
          id: string
          name: string
          phone: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          billboard_ids?: string[] | null
          company?: string | null
          contract_ids?: string[] | null
          created_at?: string
          document?: string | null
          email?: string | null
          history?: string[] | null
          id?: string
          name: string
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          billboard_ids?: string[] | null
          company?: string | null
          contract_ids?: string[] | null
          created_at?: string
          document?: string | null
          email?: string | null
          history?: string[] | null
          id?: string
          name?: string
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          billboard_ids: string[] | null
          client_id: string | null
          client_name: string | null
          created_at: string
          document_url: string | null
          end_date: string
          id: string
          monthly_value: number | null
          payment_method: string | null
          renewal_type: string | null
          start_date: string
          status: string
          total_value: number | null
          type: string
          updated_at: string
        }
        Insert: {
          billboard_ids?: string[] | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          document_url?: string | null
          end_date: string
          id?: string
          monthly_value?: number | null
          payment_method?: string | null
          renewal_type?: string | null
          start_date: string
          status?: string
          total_value?: number | null
          type?: string
          updated_at?: string
        }
        Update: {
          billboard_ids?: string[] | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          document_url?: string | null
          end_date?: string
          id?: string
          monthly_value?: number | null
          payment_method?: string | null
          renewal_type?: string | null
          start_date?: string
          status?: string
          total_value?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          billboard_ids: string[] | null
          company: string
          contact: string | null
          created_at: string
          email: string | null
          id: string
          interactions: Json | null
          notes: string | null
          origin: string | null
          phone: string | null
          stage: string
          updated_at: string
          value: number | null
        }
        Insert: {
          billboard_ids?: string[] | null
          company: string
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interactions?: Json | null
          notes?: string | null
          origin?: string | null
          phone?: string | null
          stage?: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          billboard_ids?: string[] | null
          company?: string
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          interactions?: Json | null
          notes?: string | null
          origin?: string | null
          phone?: string | null
          stage?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string
          full_name?: string
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          can_create: boolean
          can_delete: boolean
          can_edit: boolean
          can_view: boolean
          created_at: string
          id: string
          module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          can_create?: boolean
          can_delete?: boolean
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          id?: string
          module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_orders: {
        Row: {
          assignee: string | null
          billboard_code: string | null
          billboard_id: string | null
          checklist: Json | null
          client_name: string | null
          completed_date: string | null
          created_at: string
          due_date: string
          id: string
          photos_after: string[] | null
          photos_before: string[] | null
          sla_hours: number | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          billboard_code?: string | null
          billboard_id?: string | null
          checklist?: Json | null
          client_name?: string | null
          completed_date?: string | null
          created_at?: string
          due_date: string
          id?: string
          photos_after?: string[] | null
          photos_before?: string[] | null
          sla_hours?: number | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          billboard_code?: string | null
          billboard_id?: string | null
          checklist?: Json | null
          client_name?: string | null
          completed_date?: string | null
          created_at?: string
          due_date?: string
          id?: string
          photos_after?: string[] | null
          photos_before?: string[] | null
          sla_hours?: number | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_billboard_id_fkey"
            columns: ["billboard_id"]
            isOneToOne: false
            referencedRelation: "billboards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "comercial" | "operacao" | "financeiro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "comercial", "operacao", "financeiro"],
    },
  },
} as const
