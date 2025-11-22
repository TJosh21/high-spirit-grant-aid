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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_description: string
          activity_type: string
          answer_id: string | null
          created_at: string | null
          grant_id: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          activity_description: string
          activity_type: string
          answer_id?: string | null
          created_at?: string | null
          grant_id?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          activity_description?: string
          activity_type?: string
          answer_id?: string | null
          created_at?: string | null
          grant_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          alert_emails: string[]
          created_at: string
          id: string
          rate_limit_threshold: number
          unusual_pattern_threshold: number
          updated_at: string
        }
        Insert: {
          alert_emails?: string[]
          created_at?: string
          id?: string
          rate_limit_threshold?: number
          unusual_pattern_threshold?: number
          updated_at?: string
        }
        Update: {
          alert_emails?: string[]
          created_at?: string
          id?: string
          rate_limit_threshold?: number
          unusual_pattern_threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          created_at: string
          function_name: string
          id: string
          request_size: number | null
          response_size: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          function_name: string
          id?: string
          request_size?: number | null
          response_size?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          function_name?: string
          id?: string
          request_size?: number | null
          response_size?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_logs: {
        Row: {
          alert_message: string
          alert_type: string
          id: string
          metadata: Json | null
          sent_at: string
          user_id: string | null
        }
        Insert: {
          alert_message: string
          alert_type: string
          id?: string
          metadata?: Json | null
          sent_at?: string
          user_id?: string | null
        }
        Update: {
          alert_message?: string
          alert_type?: string
          id?: string
          metadata?: Json | null
          sent_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          channel_email: boolean
          channel_push: boolean
          channel_sms: boolean
          created_at: string
          error_message: string | null
          event_type: string
          grant_id: string | null
          grant_name: string | null
          id: string
          metadata: Json | null
          status: string
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          channel_email?: boolean
          channel_push?: boolean
          channel_sms?: boolean
          created_at?: string
          error_message?: string | null
          event_type: string
          grant_id?: string | null
          grant_name?: string | null
          id?: string
          metadata?: Json | null
          status: string
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          channel_email?: boolean
          channel_push?: boolean
          channel_sms?: boolean
          created_at?: string
          error_message?: string | null
          event_type?: string
          grant_id?: string | null
          grant_name?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
        ]
      }
      answer_comments: {
        Row: {
          answer_id: string
          comment_text: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer_id: string
          comment_text: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer_id?: string
          comment_text?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_comments_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "answer_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      answer_versions: {
        Row: {
          ai_polished_answer: string | null
          answer_id: string
          created_at: string | null
          id: string
          status: string | null
          user_clarification: string | null
          user_id: string
          user_rough_answer: string | null
          version_number: number
        }
        Insert: {
          ai_polished_answer?: string | null
          answer_id: string
          created_at?: string | null
          id?: string
          status?: string | null
          user_clarification?: string | null
          user_id: string
          user_rough_answer?: string | null
          version_number: number
        }
        Update: {
          ai_polished_answer?: string | null
          answer_id?: string
          created_at?: string | null
          id?: string
          status?: string | null
          user_clarification?: string | null
          user_id?: string
          user_rough_answer?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "answer_versions_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          ai_clarification: string | null
          ai_polished_answer: string | null
          created_at: string | null
          docusign_envelope_id: string | null
          estimated_completion_minutes: number | null
          grant_id: string
          id: string
          last_ai_run_at: string | null
          last_updated_at: string | null
          organization_id: string | null
          outcome: string | null
          question_id: string
          question_text_snapshot: string
          status: Database["public"]["Enums"]["answer_status"] | null
          user_clarification: string | null
          user_id: string
          user_rough_answer: string | null
        }
        Insert: {
          ai_clarification?: string | null
          ai_polished_answer?: string | null
          created_at?: string | null
          docusign_envelope_id?: string | null
          estimated_completion_minutes?: number | null
          grant_id: string
          id?: string
          last_ai_run_at?: string | null
          last_updated_at?: string | null
          organization_id?: string | null
          outcome?: string | null
          question_id: string
          question_text_snapshot: string
          status?: Database["public"]["Enums"]["answer_status"] | null
          user_clarification?: string | null
          user_id: string
          user_rough_answer?: string | null
        }
        Update: {
          ai_clarification?: string | null
          ai_polished_answer?: string | null
          created_at?: string | null
          docusign_envelope_id?: string | null
          estimated_completion_minutes?: number | null
          grant_id?: string
          id?: string
          last_ai_run_at?: string | null
          last_updated_at?: string | null
          organization_id?: string | null
          outcome?: string | null
          question_id?: string
          question_text_snapshot?: string
          status?: Database["public"]["Enums"]["answer_status"] | null
          user_clarification?: string | null
          user_id?: string
          user_rough_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      business_documents: {
        Row: {
          ai_generated_content: string | null
          created_at: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          id: string
          last_updated_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          ai_generated_content?: string | null
          created_at?: string | null
          doc_type: Database["public"]["Enums"]["doc_type"]
          id?: string
          last_updated_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          ai_generated_content?: string | null
          created_at?: string | null
          doc_type?: Database["public"]["Enums"]["doc_type"]
          id?: string
          last_updated_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          organization_id: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          organization_id?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          organization_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      grant_match_scores: {
        Row: {
          created_at: string | null
          grant_id: string
          id: string
          match_reasons: Json | null
          match_score: number
          notified: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          grant_id: string
          id?: string
          match_reasons?: Json | null
          match_score: number
          notified?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          grant_id?: string
          id?: string
          match_reasons?: Json | null
          match_score?: number
          notified?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grant_match_scores_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
        ]
      }
      grants: {
        Row: {
          amount_max: number | null
          amount_min: number | null
          application_link: string | null
          business_stage_tags: string[] | null
          created_at: string | null
          currency: string | null
          deadline: string | null
          geography_tags: string[] | null
          id: string
          industry_tags: string[] | null
          long_description: string | null
          name: string
          notes_for_admin: string | null
          short_description: string | null
          slug: string
          sponsor_name: string
          sponsor_type: string | null
          status: Database["public"]["Enums"]["grant_status"] | null
          target_audience_tags: string[] | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          amount_max?: number | null
          amount_min?: number | null
          application_link?: string | null
          business_stage_tags?: string[] | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          geography_tags?: string[] | null
          id?: string
          industry_tags?: string[] | null
          long_description?: string | null
          name: string
          notes_for_admin?: string | null
          short_description?: string | null
          slug: string
          sponsor_name: string
          sponsor_type?: string | null
          status?: Database["public"]["Enums"]["grant_status"] | null
          target_audience_tags?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          amount_max?: number | null
          amount_min?: number | null
          application_link?: string | null
          business_stage_tags?: string[] | null
          created_at?: string | null
          currency?: string | null
          deadline?: string | null
          geography_tags?: string[] | null
          id?: string
          industry_tags?: string[] | null
          long_description?: string | null
          name?: string
          notes_for_admin?: string | null
          short_description?: string | null
          slug?: string
          sponsor_name?: string
          sponsor_type?: string | null
          status?: Database["public"]["Enums"]["grant_status"] | null
          target_audience_tags?: string[] | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          annual_revenue_range: string | null
          business_description: string | null
          business_industry: string | null
          business_name: string | null
          country: string | null
          created_at: string | null
          email: string
          id: string
          is_admin: boolean
          is_minority_owned: boolean | null
          is_woman_owned: boolean | null
          name: string
          onboarding_completed: boolean | null
          state_region: string | null
          updated_at: string | null
          years_in_business: number | null
        }
        Insert: {
          annual_revenue_range?: string | null
          business_description?: string | null
          business_industry?: string | null
          business_name?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          id: string
          is_admin?: boolean
          is_minority_owned?: boolean | null
          is_woman_owned?: boolean | null
          name: string
          onboarding_completed?: boolean | null
          state_region?: string | null
          updated_at?: string | null
          years_in_business?: number | null
        }
        Update: {
          annual_revenue_range?: string | null
          business_description?: string | null
          business_industry?: string | null
          business_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean
          is_minority_owned?: boolean | null
          is_woman_owned?: boolean | null
          name?: string
          onboarding_completed?: boolean | null
          state_region?: string | null
          updated_at?: string | null
          years_in_business?: number | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          created_at: string | null
          estimated_minutes: number | null
          grant_id: string
          helper_text: string | null
          id: string
          is_active: boolean | null
          order_index: number
          question_text: string
          updated_at: string | null
          word_limit: number | null
        }
        Insert: {
          created_at?: string | null
          estimated_minutes?: number | null
          grant_id: string
          helper_text?: string | null
          id?: string
          is_active?: boolean | null
          order_index: number
          question_text: string
          updated_at?: string | null
          word_limit?: number | null
        }
        Update: {
          created_at?: string | null
          estimated_minutes?: number | null
          grant_id?: string
          helper_text?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          question_text?: string
          updated_at?: string | null
          word_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_grant_id_fkey"
            columns: ["grant_id"]
            isOneToOne: false
            referencedRelation: "grants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          expires_at: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"] | null
          started_at: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          expires_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          answer_id: string
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer_id: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer_id?: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_org_role: {
        Args: { _org_id: string; _user_id: string }
        Returns: Database["public"]["Enums"]["org_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      answer_status:
        | "not_started"
        | "in_progress"
        | "needs_clarification"
        | "ready"
      app_role: "admin" | "user"
      doc_type:
        | "business_plan"
        | "executive_summary"
        | "capability_statement"
        | "elevator_pitch"
        | "budget_overview"
        | "profit_and_loss_summary"
      grant_status: "open" | "coming_soon" | "closed"
      org_role: "owner" | "admin" | "member" | "viewer"
      subscription_plan: "free" | "pro" | "elite"
      subscription_status: "active" | "canceled" | "trial"
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
      answer_status: [
        "not_started",
        "in_progress",
        "needs_clarification",
        "ready",
      ],
      app_role: ["admin", "user"],
      doc_type: [
        "business_plan",
        "executive_summary",
        "capability_statement",
        "elevator_pitch",
        "budget_overview",
        "profit_and_loss_summary",
      ],
      grant_status: ["open", "coming_soon", "closed"],
      org_role: ["owner", "admin", "member", "viewer"],
      subscription_plan: ["free", "pro", "elite"],
      subscription_status: ["active", "canceled", "trial"],
    },
  },
} as const
