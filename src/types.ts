export interface ProductionOrder {
    id: number;
    code: string;
    qty_plan: number;
    start_plan: string;
    end_plan: string;
    status: string;
    products: {
      name: string;
    } | null;
    actual_qty?: number;
    progress?: number;
  }
  
  export interface UserData {
    full_name: string;
    role: string;
  }