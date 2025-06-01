export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      note_pages: {
        Row: {
          id: string;
          last_modified: string | null;
          notebook_id: string;
          page_number: number;
        };
        Insert: {
          id: string;
          last_modified?: string | null;
          notebook_id: string;
          page_number: number;
        };
        Update: {
          id?: string;
          last_modified?: string | null;
          notebook_id?: string;
          page_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "note_pages_notebook_id_fkey";
            columns: ["notebook_id"];
            isOneToOne: false;
            referencedRelation: "registered_notebooks";
            referencedColumns: ["id"];
          }
        ];
      };
      note_types: {
        Row: {
          created_at: string | null;
          description: string | null;
          icon: string | null;
          id: string;
          is_active: boolean | null;
          max_size_mb: number | null;
          name: string;
          sort_order: number | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id: string;
          is_active?: boolean | null;
          max_size_mb?: number | null;
          name: string;
          sort_order?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_size_mb?: number | null;
          name?: string;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      notebook_categories: {
        Row: {
          color: string;
          created_at: string | null;
          description: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          sort_order: number | null;
        };
        Insert: {
          color: string;
          created_at?: string | null;
          description?: string | null;
          id: string;
          is_active?: boolean | null;
          name: string;
          sort_order?: number | null;
        };
        Update: {
          color?: string;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          sort_order?: number | null;
        };
        Relationships: [];
      };
      notebook_templates: {
        Row: {
          category_id: string;
          cover_image: string | null;
          description: string | null;
          id: string;
          pages: number;
          title: string;
        };
        Insert: {
          category_id?: string;
          cover_image?: string | null;
          description?: string | null;
          id: string;
          pages: number;
          title: string;
        };
        Update: {
          category_id?: string;
          cover_image?: string | null;
          description?: string | null;
          id?: string;
          pages?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notebook_templates_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "notebook_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      notes: {
        Row: {
          content: string;
          created_at: string | null;
          duration: number | null;
          file_url: string | null;
          id: string;
          page_id: string;
          updated_at: string | null;
          type_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          duration?: number | null;
          file_url?: string | null;
          id?: string;
          page_id: string;
          updated_at?: string | null;
          type_id?: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          duration?: number | null;
          file_url?: string | null;
          id?: string;
          page_id?: string;
          updated_at?: string | null;
          type_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notes_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "note_pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notes_type_id_fkey";
            columns: ["type_id"];
            isOneToOne: false;
            referencedRelation: "note_types";
            referencedColumns: ["id"];
          }
        ];
      };
      page_group_members: {
        Row: {
          created_at: string;
          group_id: string;
          id: string;
          page_number: number;
        };
        Insert: {
          created_at?: string;
          group_id: string;
          id?: string;
          page_number: number;
        };
        Update: {
          created_at?: string;
          group_id?: string;
          id?: string;
          page_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "page_group_members_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "page_groups";
            referencedColumns: ["id"];
          }
        ];
      };
      page_groups: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          notebook_id: string;
          sort_order: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          notebook_id: string;
          sort_order?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          notebook_id?: string;
          sort_order?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_groups_notebook_id_fkey";
            columns: ["notebook_id"];
            isOneToOne: false;
            referencedRelation: "registered_notebooks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "page_groups_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar: string | null;
          created_at: string | null;
          email: string;
          id: string;
          name: string;
          plan_expires_at: string | null;
          plan_id: string | null;
        };
        Insert: {
          avatar?: string | null;
          created_at?: string | null;
          email: string;
          id: string;
          name: string;
          plan_expires_at?: string | null;
          plan_id?: string | null;
        };
        Update: {
          avatar?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          name?: string;
          plan_expires_at?: string | null;
          plan_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "user_plans";
            referencedColumns: ["id"];
          }
        ];
      };
      registered_notebooks: {
        Row: {
          category_id: string;
          cover_image: string | null;
          id: string;
          last_used: string | null;
          nickname: string;
          registered_at: string | null;
          title: string;
          total_pages: number;
          user_id: string;
        };
        Insert: {
          category_id?: string;
          cover_image?: string | null;
          id: string;
          last_used?: string | null;
          nickname: string;
          registered_at?: string | null;
          title: string;
          total_pages: number;
          user_id: string;
        };
        Update: {
          category_id?: string;
          cover_image?: string | null;
          id?: string;
          last_used?: string | null;
          nickname?: string;
          registered_at?: string | null;
          title?: string;
          total_pages?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registered_notebooks_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "notebook_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "registered_notebooks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      user_plans: {
        Row: {
          created_at: string | null;
          display_name: string;
          features: Json | null;
          id: string;
          is_active: boolean | null;
          max_file_size_mb: number | null;
          max_notebooks: number;
          max_notes_per_page: number | null;
          name: string;
          price_monthly: number | null;
          price_yearly: number | null;
          sort_order: number | null;
        };
        Insert: {
          created_at?: string | null;
          display_name: string;
          features?: Json | null;
          id: string;
          is_active?: boolean | null;
          max_file_size_mb?: number | null;
          max_notebooks: number;
          max_notes_per_page?: number | null;
          name: string;
          price_monthly?: number | null;
          price_yearly?: number | null;
          sort_order?: number | null;
        };
        Update: {
          created_at?: string | null;
          display_name?: string;
          features?: Json | null;
          id?: string;
          is_active?: boolean | null;
          max_file_size_mb?: number | null;
          max_notebooks?: number;
          max_notes_per_page?: number | null;
          name?: string;
          price_monthly?: number | null;
          price_yearly?: number | null;
          sort_order?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
