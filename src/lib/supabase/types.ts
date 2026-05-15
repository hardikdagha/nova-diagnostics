export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone: string | null;
          role: "patient" | "staff" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      patients: {
        Row: {
          id: string;
          full_name: string;
          mobile: string;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["patients"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["patients"]["Insert"]>;
      };
      reports: {
        Row: {
          id: string;
          report_number: string;
          patient_id: string | null;
          patient_name: string;
          patient_mobile: string;
          patient_email: string | null;
          test_name: string;
          report_date: string;
          file_path: string;
          token_hash: string;
          token: string | null;
          status: "draft" | "ready" | "archived" | "revoked";
          expires_at: string | null;
          revoked_at: string | null;
          download_count: number;
          max_downloads: number | null;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reports"]["Row"], "id" | "created_at" | "updated_at" | "download_count" | "token"> & { token?: string | null };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
      };
      report_access_logs: {
        Row: {
          id: string;
          report_id: string | null;
          action: "view_link" | "download" | "fallback_lookup" | "expired" | "revoked" | "failed";
          success: boolean;
          access_method: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["report_access_logs"]["Row"], "id" | "created_at">;
        Update: never;
      };
      staff_users: {
        Row: {
          id: string;
          user_id: string;
          role: "staff" | "admin";
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["staff_users"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["staff_users"]["Insert"]>;
      };
      contact_enquiries: {
        Row: {
          id: string;
          full_name: string;
          mobile: string;
          email: string | null;
          inquiry_type: string | null;
          message: string | null;
          status: string;
          staff_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contact_enquiries"]["Row"], "id" | "created_at" | "updated_at" | "status"> & { status?: string };
        Update: Partial<Omit<Database["public"]["Tables"]["contact_enquiries"]["Row"], "id" | "created_at">>;
      };
      home_collection_requests: {
        Row: {
          id: string;
          full_name: string;
          mobile: string;
          email: string | null;
          area_location: string;
          full_address: string | null;
          preferred_date: string | null;
          preferred_time_slot: string | null;
          test_package_required: string | null;
          fasting_preference: string | null;
          prescription_file_path: string | null;
          notes: string | null;
          status: string;
          staff_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["home_collection_requests"]["Row"], "id" | "created_at" | "updated_at" | "status"> & { status?: string };
        Update: Partial<Omit<Database["public"]["Tables"]["home_collection_requests"]["Row"], "id" | "created_at">>;
      };
      prescription_requests: {
        Row: {
          id: string;
          full_name: string;
          mobile: string;
          email: string | null;
          preferred_service: string | null;
          area_location: string | null;
          prescription_file_path: string | null;
          notes: string | null;
          status: string;
          staff_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["prescription_requests"]["Row"], "id" | "created_at" | "updated_at" | "status"> & { status?: string };
        Update: Partial<Omit<Database["public"]["Tables"]["prescription_requests"]["Row"], "id" | "created_at">>;
      };
    };
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type ReportAccessLog = Database["public"]["Tables"]["report_access_logs"]["Row"];
export type StaffUser = Database["public"]["Tables"]["staff_users"]["Row"];
export type ContactEnquiry = Database["public"]["Tables"]["contact_enquiries"]["Row"];
export type HomeCollectionRequest = Database["public"]["Tables"]["home_collection_requests"]["Row"];
export type PrescriptionRequest = Database["public"]["Tables"]["prescription_requests"]["Row"];
