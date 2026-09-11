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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      checagens: {
        Row: {
          cliente_id: string
          created_at: string
          data: string
          id: string
          user_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data: string
          id?: string
          user_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checagens_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          agencia: string
          ativo: boolean
          created_at: string
          dia_pagamento: string | null
          id: string
          mensal: number | null
          nome: string
          observacao: string | null
          ordem: number
          servico: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agencia?: string
          ativo?: boolean
          created_at?: string
          dia_pagamento?: string | null
          id?: string
          mensal?: number | null
          nome: string
          observacao?: string | null
          ordem?: number
          servico?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agencia?: string
          ativo?: boolean
          created_at?: string
          dia_pagamento?: string | null
          id?: string
          mensal?: number | null
          nome?: string
          observacao?: string | null
          ordem?: number
          servico?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_notes: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          texto: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          texto: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          texto?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_notes_lead_owner_fkey"
            columns: ["lead_id", "user_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id", "user_id"]
          },
        ]
      }
      leads: {
        Row: {
          arquivado: boolean
          campanha: string | null
          created_at: string
          data_entrada: string
          id: string
          nicho: string | null
          nome: string
          origem: string
          proxima_acao: string | null
          proxima_acao_em: string | null
          status: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          arquivado?: boolean
          campanha?: string | null
          created_at?: string
          data_entrada?: string
          id?: string
          nicho?: string | null
          nome: string
          origem?: string
          proxima_acao?: string | null
          proxima_acao_em?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          arquivado?: boolean
          campanha?: string | null
          created_at?: string
          data_entrada?: string
          id?: string
          nicho?: string | null
          nome?: string
          origem?: string
          proxima_acao?: string | null
          proxima_acao_em?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      metas: {
        Row: {
          alvo: number
          atual: number
          created_at: string
          id: string
          mes: string
          titulo: string
          user_id: string
        }
        Insert: {
          alvo?: number
          atual?: number
          created_at?: string
          id?: string
          mes: string
          titulo: string
          user_id: string
        }
        Update: {
          alvo?: number
          atual?: number
          created_at?: string
          id?: string
          mes?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      tarefas: {
        Row: {
          created_at: string
          data: string
          feita: boolean
          hora: string | null
          id: string
          prioridade: string
          texto: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: string
          feita?: boolean
          hora?: string | null
          id?: string
          prioridade?: string
          texto: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          feita?: boolean
          hora?: string | null
          id?: string
          prioridade?: string
          texto?: string
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
