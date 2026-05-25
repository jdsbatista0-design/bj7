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
      activities: {
        Row: {
          client_id: string | null
          completed_at: string | null
          created_at: string | null
          deleted_at: string | null
          duration_minutes: number | null
          id: string
          lead_id: string | null
          notes: string | null
          outcome: Database["public"]["Enums"]["activity_outcome"] | null
          scheduled_at: string | null
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          outcome?: Database["public"]["Enums"]["activity_outcome"] | null
          scheduled_at?: string | null
          type: Database["public"]["Enums"]["activity_type"]
          user_id: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          outcome?: Database["public"]["Enums"]["activity_outcome"] | null
          scheduled_at?: string | null
          type?: Database["public"]["Enums"]["activity_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      billboards: {
        Row: {
          active: boolean | null
          address: string | null
          area: number | null
          argumentos_comerciais: string[] | null
          audience_profile: string | null
          city: string
          code: string
          commercial_description: string | null
          cost: number | null
          created_at: string
          cta_ideal: string | null
          deleted_at: string | null
          description: string | null
          dimension: string | null
          direction: string | null
          empresas_ideais: string[] | null
          estimated_flow: number | null
          fluxo_observacao: string | null
          fonte_fluxo: string | null
          formats: string[] | null
          gallery: string[] | null
          google_street_view_url: string | null
          height: number | null
          id: string
          illumination: string | null
          land_owner: string | null
          land_owner_id: string | null
          lat: number
          lng: number
          main_photo: string | null
          maps_url: string | null
          observacoes_internas: string | null
          operational_status: string | null
          photos: string[] | null
          preco_minimo: number | null
          preco_promocional: number | null
          price: number | null
          production_cost: number | null
          promocao_validade: string | null
          region: string
          responsavel_comercial: string | null
          route: string
          seasonality: string | null
          short_description: string | null
          show_on_site: boolean | null
          status: string
          title: string | null
          traffic_type: string | null
          type: string
          updated_at: string
          width: number | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          area?: number | null
          argumentos_comerciais?: string[] | null
          audience_profile?: string | null
          city?: string
          code: string
          commercial_description?: string | null
          cost?: number | null
          created_at?: string
          cta_ideal?: string | null
          deleted_at?: string | null
          description?: string | null
          dimension?: string | null
          direction?: string | null
          empresas_ideais?: string[] | null
          estimated_flow?: number | null
          fluxo_observacao?: string | null
          fonte_fluxo?: string | null
          formats?: string[] | null
          gallery?: string[] | null
          google_street_view_url?: string | null
          height?: number | null
          id?: string
          illumination?: string | null
          land_owner?: string | null
          land_owner_id?: string | null
          lat: number
          lng: number
          main_photo?: string | null
          maps_url?: string | null
          observacoes_internas?: string | null
          operational_status?: string | null
          photos?: string[] | null
          preco_minimo?: number | null
          preco_promocional?: number | null
          price?: number | null
          production_cost?: number | null
          promocao_validade?: string | null
          region?: string
          responsavel_comercial?: string | null
          route?: string
          seasonality?: string | null
          short_description?: string | null
          show_on_site?: boolean | null
          status?: string
          title?: string | null
          traffic_type?: string | null
          type?: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          area?: number | null
          argumentos_comerciais?: string[] | null
          audience_profile?: string | null
          city?: string
          code?: string
          commercial_description?: string | null
          cost?: number | null
          created_at?: string
          cta_ideal?: string | null
          deleted_at?: string | null
          description?: string | null
          dimension?: string | null
          direction?: string | null
          empresas_ideais?: string[] | null
          estimated_flow?: number | null
          fluxo_observacao?: string | null
          fonte_fluxo?: string | null
          formats?: string[] | null
          gallery?: string[] | null
          google_street_view_url?: string | null
          height?: number | null
          id?: string
          illumination?: string | null
          land_owner?: string | null
          land_owner_id?: string | null
          lat?: number
          lng?: number
          main_photo?: string | null
          maps_url?: string | null
          observacoes_internas?: string | null
          operational_status?: string | null
          photos?: string[] | null
          preco_minimo?: number | null
          preco_promocional?: number | null
          price?: number | null
          production_cost?: number | null
          promocao_validade?: string | null
          region?: string
          responsavel_comercial?: string | null
          route?: string
          seasonality?: string | null
          short_description?: string | null
          show_on_site?: boolean | null
          status?: string
          title?: string | null
          traffic_type?: string | null
          type?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      cadence_steps: {
        Row: {
          advance_if_no_response: boolean | null
          cadence_id: string
          channel: Database["public"]["Enums"]["comm_channel"]
          delay_hours: number
          id: string
          prompt_code: string
          step_order: number
          template: string | null
        }
        Insert: {
          advance_if_no_response?: boolean | null
          cadence_id: string
          channel: Database["public"]["Enums"]["comm_channel"]
          delay_hours?: number
          id?: string
          prompt_code: string
          step_order: number
          template?: string | null
        }
        Update: {
          advance_if_no_response?: boolean | null
          cadence_id?: string
          channel?: Database["public"]["Enums"]["comm_channel"]
          delay_hours?: number
          id?: string
          prompt_code?: string
          step_order?: number
          template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cadence_steps_cadence_id_fkey"
            columns: ["cadence_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
        ]
      }
      cadences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger: Database["public"]["Enums"]["cadence_trigger"]
          trigger_conditions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger: Database["public"]["Enums"]["cadence_trigger"]
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger?: Database["public"]["Enums"]["cadence_trigger"]
          trigger_conditions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          audience_config: Json | null
          audience_description: string | null
          clicks: number | null
          contracts_attributed: number | null
          conversations: number | null
          created_at: string | null
          daily_budget: number | null
          ends_at: string | null
          id: string
          impressions: number | null
          last_synced_at: string | null
          leads_generated: number | null
          meta_account_id: string | null
          meta_campaign_id: string | null
          name: string
          objective: Database["public"]["Enums"]["campaign_objective"]
          revenue_attributed: number | null
          spent_to_date: number | null
          starts_at: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          total_budget: number | null
          updated_at: string | null
        }
        Insert: {
          audience_config?: Json | null
          audience_description?: string | null
          clicks?: number | null
          contracts_attributed?: number | null
          conversations?: number | null
          created_at?: string | null
          daily_budget?: number | null
          ends_at?: string | null
          id?: string
          impressions?: number | null
          last_synced_at?: string | null
          leads_generated?: number | null
          meta_account_id?: string | null
          meta_campaign_id?: string | null
          name: string
          objective: Database["public"]["Enums"]["campaign_objective"]
          revenue_attributed?: number | null
          spent_to_date?: number | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Update: {
          audience_config?: Json | null
          audience_description?: string | null
          clicks?: number | null
          contracts_attributed?: number | null
          conversations?: number | null
          created_at?: string | null
          daily_budget?: number | null
          ends_at?: string | null
          id?: string
          impressions?: number | null
          last_synced_at?: string | null
          leads_generated?: number | null
          meta_account_id?: string | null
          meta_campaign_id?: string | null
          name?: string
          objective?: Database["public"]["Enums"]["campaign_objective"]
          revenue_attributed?: number | null
          spent_to_date?: number | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          total_budget?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          bank_info: string | null
          billboard_ids: string[] | null
          company: string | null
          contact_person: string | null
          contract_ids: string[] | null
          created_at: string
          deleted_at: string | null
          document: string | null
          email: string | null
          history: string[] | null
          id: string
          land_registry: string | null
          name: string
          notes: string | null
          phone: string | null
          property_area: string | null
          segment: string | null
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          bank_info?: string | null
          billboard_ids?: string[] | null
          company?: string | null
          contact_person?: string | null
          contract_ids?: string[] | null
          created_at?: string
          deleted_at?: string | null
          document?: string | null
          email?: string | null
          history?: string[] | null
          id?: string
          land_registry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          property_area?: string | null
          segment?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          bank_info?: string | null
          billboard_ids?: string[] | null
          company?: string | null
          contact_person?: string | null
          contract_ids?: string[] | null
          created_at?: string
          deleted_at?: string | null
          document?: string | null
          email?: string | null
          history?: string[] | null
          id?: string
          land_registry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          property_area?: string | null
          segment?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      communications: {
        Row: {
          attachments: Json | null
          cadence_run_id: string | null
          channel: Database["public"]["Enums"]["comm_channel"]
          client_id: string | null
          content: string
          created_at: string | null
          delivered_at: string | null
          direction: Database["public"]["Enums"]["comm_direction"]
          external_id: string | null
          id: string
          is_automated: boolean | null
          lead_id: string | null
          read_at: string | null
          replied_at: string | null
          sent_at: string | null
          sent_by: string | null
          status: Database["public"]["Enums"]["comm_status"] | null
          subject: string | null
        }
        Insert: {
          attachments?: Json | null
          cadence_run_id?: string | null
          channel: Database["public"]["Enums"]["comm_channel"]
          client_id?: string | null
          content: string
          created_at?: string | null
          delivered_at?: string | null
          direction: Database["public"]["Enums"]["comm_direction"]
          external_id?: string | null
          id?: string
          is_automated?: boolean | null
          lead_id?: string | null
          read_at?: string | null
          replied_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["comm_status"] | null
          subject?: string | null
        }
        Update: {
          attachments?: Json | null
          cadence_run_id?: string | null
          channel?: Database["public"]["Enums"]["comm_channel"]
          client_id?: string | null
          content?: string
          created_at?: string | null
          delivered_at?: string | null
          direction?: Database["public"]["Enums"]["comm_direction"]
          external_id?: string | null
          id?: string
          is_automated?: boolean | null
          lead_id?: string | null
          read_at?: string | null
          replied_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: Database["public"]["Enums"]["comm_status"] | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_comm_cadence_run"
            columns: ["cadence_run_id"]
            isOneToOne: false
            referencedRelation: "lead_cadence_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          approved_by: string | null
          billboard_ids: string[] | null
          client_id: string | null
          copy: string | null
          created_at: string | null
          created_by: string | null
          drive_url: string | null
          engagement: number | null
          external_post_id: string | null
          format: Database["public"]["Enums"]["content_format"]
          hashtags: string[] | null
          id: string
          impressions: number | null
          leads_generated: number | null
          pillar: Database["public"]["Enums"]["content_pillar"]
          published_at: string | null
          reach: number | null
          saves: number | null
          scheduled_for: string | null
          script: string | null
          shares: number | null
          status: Database["public"]["Enums"]["content_status"] | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          billboard_ids?: string[] | null
          client_id?: string | null
          copy?: string | null
          created_at?: string | null
          created_by?: string | null
          drive_url?: string | null
          engagement?: number | null
          external_post_id?: string | null
          format: Database["public"]["Enums"]["content_format"]
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          pillar: Database["public"]["Enums"]["content_pillar"]
          published_at?: string | null
          reach?: number | null
          saves?: number | null
          scheduled_for?: string | null
          script?: string | null
          shares?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          billboard_ids?: string[] | null
          client_id?: string | null
          copy?: string | null
          created_at?: string | null
          created_by?: string | null
          drive_url?: string | null
          engagement?: number | null
          external_post_id?: string | null
          format?: Database["public"]["Enums"]["content_format"]
          hashtags?: string[] | null
          id?: string
          impressions?: number | null
          leads_generated?: number | null
          pillar?: Database["public"]["Enums"]["content_pillar"]
          published_at?: string | null
          reach?: number | null
          saves?: number | null
          scheduled_for?: string | null
          script?: string | null
          shares?: number | null
          status?: Database["public"]["Enums"]["content_status"] | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          billboard_ids: string[] | null
          client_id: string | null
          client_name: string | null
          created_at: string
          deleted_at: string | null
          document_url: string | null
          end_date: string
          id: string
          monthly_value: number | null
          notes: string | null
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
          deleted_at?: string | null
          document_url?: string | null
          end_date: string
          id?: string
          monthly_value?: number | null
          notes?: string | null
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
          deleted_at?: string | null
          document_url?: string | null
          end_date?: string
          id?: string
          monthly_value?: number | null
          notes?: string | null
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
      financial_entries: {
        Row: {
          amount: number
          billboard_id: string | null
          category: string
          client_id: string | null
          contract_id: string | null
          created_at: string
          deleted_at: string | null
          description: string
          entry_date: string
          id: string
          notes: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          billboard_id?: string | null
          category?: string
          client_id?: string | null
          contract_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          entry_date?: string
          id?: string
          notes?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billboard_id?: string | null
          category?: string
          client_id?: string | null
          contract_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string
          entry_date?: string
          id?: string
          notes?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_entries_billboard_id_fkey"
            columns: ["billboard_id"]
            isOneToOne: false
            referencedRelation: "billboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_entries_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_cadence_runs: {
        Row: {
          cadence_id: string
          client_id: string | null
          completed_at: string | null
          current_step: number | null
          id: string
          lead_id: string | null
          next_run_at: string | null
          paused_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["cadence_run_status"] | null
        }
        Insert: {
          cadence_id: string
          client_id?: string | null
          completed_at?: string | null
          current_step?: number | null
          id?: string
          lead_id?: string | null
          next_run_at?: string | null
          paused_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["cadence_run_status"] | null
        }
        Update: {
          cadence_id?: string
          client_id?: string | null
          completed_at?: string | null
          current_step?: number | null
          id?: string
          lead_id?: string | null
          next_run_at?: string | null
          paused_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["cadence_run_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_cadence_runs_cadence_id_fkey"
            columns: ["cadence_id"]
            isOneToOne: false
            referencedRelation: "cadences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_cadence_runs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_cadence_runs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          billboard_ids: string[] | null
          campaign_id: string | null
          company: string
          contact: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          interactions: Json | null
          notes: string | null
          origin: string | null
          phone: string | null
          stage: string
          tags: string[] | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          value: number | null
        }
        Insert: {
          billboard_ids?: string[] | null
          campaign_id?: string | null
          company: string
          contact?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          interactions?: Json | null
          notes?: string | null
          origin?: string | null
          phone?: string | null
          stage?: string
          tags?: string[] | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          value?: number | null
        }
        Update: {
          billboard_ids?: string[] | null
          campaign_id?: string | null
          company?: string
          contact?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          interactions?: Json | null
          notes?: string | null
          origin?: string | null
          phone?: string | null
          stage?: string
          tags?: string[] | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
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
      prompt_history: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          id: string
          prompt_id: string
          template: string
          version: number
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          id?: string
          prompt_id: string
          template: string
          version: number
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          id?: string
          prompt_id?: string
          template?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_history_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          category: string
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          performance_data: Json | null
          template: string
          updated_at: string | null
          variables: string[] | null
          version: number | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          performance_data?: Json | null
          template: string
          updated_at?: string | null
          variables?: string[] | null
          version?: number | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          performance_data?: Json | null
          template?: string
          updated_at?: string | null
          variables?: string[] | null
          version?: number | null
        }
        Relationships: []
      }
      seller_metrics: {
        Row: {
          activities_count: number | null
          avg_close_days: number | null
          avg_first_response_minutes: number | null
          avg_qualification_hours: number | null
          avg_ticket: number | null
          calls_made: number | null
          created_at: string | null
          id: string
          leads_closed: number | null
          leads_in_proposal: number | null
          leads_lost: number | null
          leads_qualified: number | null
          leads_received: number | null
          meetings_held: number | null
          messages_sent: number | null
          proposals_sent: number | null
          revenue_generated: number | null
          snapshot_date: string
          user_id: string
        }
        Insert: {
          activities_count?: number | null
          avg_close_days?: number | null
          avg_first_response_minutes?: number | null
          avg_qualification_hours?: number | null
          avg_ticket?: number | null
          calls_made?: number | null
          created_at?: string | null
          id?: string
          leads_closed?: number | null
          leads_in_proposal?: number | null
          leads_lost?: number | null
          leads_qualified?: number | null
          leads_received?: number | null
          meetings_held?: number | null
          messages_sent?: number | null
          proposals_sent?: number | null
          revenue_generated?: number | null
          snapshot_date: string
          user_id: string
        }
        Update: {
          activities_count?: number | null
          avg_close_days?: number | null
          avg_first_response_minutes?: number | null
          avg_qualification_hours?: number | null
          avg_ticket?: number | null
          calls_made?: number | null
          created_at?: string | null
          id?: string
          leads_closed?: number | null
          leads_in_proposal?: number | null
          leads_lost?: number | null
          leads_qualified?: number | null
          leads_received?: number | null
          meetings_held?: number | null
          messages_sent?: number | null
          proposals_sent?: number | null
          revenue_generated?: number | null
          snapshot_date?: string
          user_id?: string
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
          client_id: string | null
          client_name: string | null
          completed_date: string | null
          contract_id: string | null
          created_at: string
          deleted_at: string | null
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
          client_id?: string | null
          client_name?: string | null
          completed_date?: string | null
          contract_id?: string | null
          created_at?: string
          deleted_at?: string | null
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
          client_id?: string | null
          client_name?: string | null
          completed_date?: string | null
          contract_id?: string | null
          created_at?: string
          deleted_at?: string | null
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
          {
            foreignKeyName: "work_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
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
      activity_outcome:
        | "completed"
        | "no_answer"
        | "reschedule"
        | "positive"
        | "negative"
        | "neutral"
      activity_type:
        | "call"
        | "whatsapp"
        | "email"
        | "meeting"
        | "visit"
        | "proposal_sent"
        | "document_sent"
        | "follow_up"
        | "note"
      app_role: "admin" | "comercial" | "operacao" | "financeiro" | "usuario"
      cadence_run_status:
        | "running"
        | "paused_by_response"
        | "paused_manually"
        | "completed"
        | "cancelled"
      cadence_trigger:
        | "lead_created"
        | "lead_qualified"
        | "proposal_sent"
        | "contract_signed"
        | "lead_lost"
        | "contract_expiring"
        | "manual"
      campaign_objective:
        | "awareness"
        | "traffic"
        | "engagement"
        | "leads"
        | "messages"
        | "conversions"
        | "sales"
      campaign_status: "draft" | "active" | "paused" | "completed" | "archived"
      comm_channel:
        | "whatsapp"
        | "email"
        | "instagram_dm"
        | "sms"
        | "phone"
        | "web_form"
      comm_direction: "in" | "out"
      comm_status:
        | "queued"
        | "sent"
        | "delivered"
        | "read"
        | "replied"
        | "failed"
      content_format:
        | "post_feed"
        | "carousel"
        | "reel"
        | "story"
        | "ad"
        | "live"
      content_pillar:
        | "vitrine"
        | "case"
        | "bastidor"
        | "educativo"
        | "comparativo"
        | "sazonal"
        | "nicho"
        | "institucional"
        | "comercial"
      content_status:
        | "idea"
        | "script"
        | "art"
        | "review"
        | "approved"
        | "scheduled"
        | "published"
        | "archived"
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
      activity_outcome: [
        "completed",
        "no_answer",
        "reschedule",
        "positive",
        "negative",
        "neutral",
      ],
      activity_type: [
        "call",
        "whatsapp",
        "email",
        "meeting",
        "visit",
        "proposal_sent",
        "document_sent",
        "follow_up",
        "note",
      ],
      app_role: ["admin", "comercial", "operacao", "financeiro", "usuario"],
      cadence_run_status: [
        "running",
        "paused_by_response",
        "paused_manually",
        "completed",
        "cancelled",
      ],
      cadence_trigger: [
        "lead_created",
        "lead_qualified",
        "proposal_sent",
        "contract_signed",
        "lead_lost",
        "contract_expiring",
        "manual",
      ],
      campaign_objective: [
        "awareness",
        "traffic",
        "engagement",
        "leads",
        "messages",
        "conversions",
        "sales",
      ],
      campaign_status: ["draft", "active", "paused", "completed", "archived"],
      comm_channel: [
        "whatsapp",
        "email",
        "instagram_dm",
        "sms",
        "phone",
        "web_form",
      ],
      comm_direction: ["in", "out"],
      comm_status: ["queued", "sent", "delivered", "read", "replied", "failed"],
      content_format: ["post_feed", "carousel", "reel", "story", "ad", "live"],
      content_pillar: [
        "vitrine",
        "case",
        "bastidor",
        "educativo",
        "comparativo",
        "sazonal",
        "nicho",
        "institucional",
        "comercial",
      ],
      content_status: [
        "idea",
        "script",
        "art",
        "review",
        "approved",
        "scheduled",
        "published",
        "archived",
      ],
    },
  },
} as const
