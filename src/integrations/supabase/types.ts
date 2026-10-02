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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      atividades: {
        Row: {
          created_at: string
          descricao: string
          id: string
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          tipo?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      conteudos: {
        Row: {
          created_at: string
          data_planejada: string | null
          id: string
          observacoes: string
          status: string
          tema: string
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_planejada?: string | null
          id?: string
          observacoes?: string
          status?: string
          tema?: string
          tipo?: string
          titulo: string
          user_id?: string
        }
        Update: {
          created_at?: string
          data_planejada?: string | null
          id?: string
          observacoes?: string
          status?: string
          tema?: string
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          data_entrada: string
          email: string
          id: string
          nome: string
          observacoes: string
          servico: string
          status: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          data_entrada?: string
          email?: string
          id?: string
          nome: string
          observacoes?: string
          servico?: string
          status?: string
          user_id?: string
          whatsapp?: string
        }
        Update: {
          created_at?: string
          data_entrada?: string
          email?: string
          id?: string
          nome?: string
          observacoes?: string
          servico?: string
          status?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      oportunidades: {
        Row: {
          created_at: string
          data: string
          id: string
          lead_id: string | null
          nome: string
          observacoes: string
          servico: string
          status: string
          user_id: string
          valor_estimado: number
        }
        Insert: {
          created_at?: string
          data?: string
          id?: string
          lead_id?: string | null
          nome: string
          observacoes?: string
          servico?: string
          status?: string
          user_id?: string
          valor_estimado?: number
        }
        Update: {
          created_at?: string
          data?: string
          id?: string
          lead_id?: string | null
          nome?: string
          observacoes?: string
          servico?: string
          status?: string
          user_id?: string
          valor_estimado?: number
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area_de_atuacao: string
          clinica: string
          created_at: string
          email: string
          id: string
          nome: string
          telefone: string
        }
        Insert: {
          area_de_atuacao?: string
          clinica?: string
          created_at?: string
          email?: string
          id: string
          nome?: string
          telefone?: string
        }
        Update: {
          area_de_atuacao?: string
          clinica?: string
          created_at?: string
          email?: string
          id?: string
          nome?: string
          telefone?: string
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          created_at: string
          descricao: string
          id: string
          prazo: string | null
          prioridade: string
          responsavel: string
          status: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string
          id?: string
          prazo?: string | null
          prioridade?: string
          responsavel?: string
          status?: string
          titulo: string
          user_id?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          prazo?: string | null
          prioridade?: string
          responsavel?: string
          status?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
