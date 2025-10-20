import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string()
    .trim()
    .nonempty({ message: "Tên đăng nhập không được để trống" })
    .min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự" })
    .max(50, { message: "Tên đăng nhập không được quá 50 ký tự" }),
  password: z.string()
    .nonempty({ message: "Mật khẩu không được để trống" })
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
  shift: z.string()
    .nonempty({ message: "Vui lòng chọn ca làm việc" }),
  role: z.string()
    .nonempty({ message: "Vui lòng chọn vai trò" })
});

export const productionRecordingSchema = z.object({
  okQuantity: z.string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Số lượng OK phải là số không âm"
    }),
  ngQuantity: z.string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) >= 0), {
      message: "Số lượng NG phải là số không âm"
    }),
  notes: z.string().optional()
}).refine((data) => {
  const ok = Number(data.okQuantity) || 0;
  const ng = Number(data.ngQuantity) || 0;
  return ok + ng > 0;
}, {
  message: "Phải nhập ít nhất một trong số lượng OK hoặc NG",
  path: ["okQuantity"]
});

export const productSchema = z.object({
  code: z.string()
    .trim()
    .nonempty({ message: "Mã sản phẩm không được để trống" })
    .max(20, { message: "Mã sản phẩm không được quá 20 ký tự" }),
  name: z.string()
    .trim()
    .nonempty({ message: "Tên sản phẩm không được để trống" })
    .max(100, { message: "Tên sản phẩm không được quá 100 ký tự" }),
  version: z.string()
    .trim()
    .max(20, { message: "Phiên bản không được quá 20 ký tự" }),
  unit: z.string()
    .trim()
    .nonempty({ message: "Đơn vị tính không được để trống" })
    .max(10, { message: "Đơn vị tính không được quá 10 ký tự" }),
  routingSteps: z.array(z.object({
    operationId: z.string().min(1, "Vui lòng chọn công đoạn"),
    stdTimeSec: z.number().min(1, "Thời gian chuẩn phải là số dương"),
  })).optional(),
});

export const operationSchema = z.object({
  code: z.string()
    .trim()
    .nonempty({ message: "Mã công đoạn không được để trống" })
    .max(20, { message: "Mã công đoạn không được quá 20 ký tự" }),
  name: z.string()
    .trim()
    .nonempty({ message: "Tên công đoạn không được để trống" })
    .max(100, { message: "Tên công đoạn không được quá 100 ký tự" }),
  machineType: z.string()
    .trim()
    .max(50, { message: "Loại máy không được quá 50 ký tự" }),
  targetTime: z.string()
    .refine((val) => val === '' || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Thời gian mục tiêu phải là số dương"
    }),
  description: z.string()
    .max(500, { message: "Mô tả không được quá 500 ký tự" })
});

export const defectCodeSchema = z.object({
  code: z.string()
    .trim()
    .nonempty({ message: "Mã lỗi không được để trống" })
    .max(10, { message: "Mã lỗi không được quá 10 ký tự" }),
  description: z.string()
    .trim()
    .nonempty({ message: "Mô tả lỗi không được để trống" })
    .max(200, { message: "Mô tả lỗi không được quá 200 ký tự" }),
  category: z.string()
    .trim()
    .nonempty({ message: "Vui lòng chọn nhóm lỗi" }),
  severity: z.string()
    .trim()
    .nonempty({ message: "Vui lòng chọn mức độ nghiêm trọng" })
});

export const userSchema = z.object({
  username: z.string()
    .trim()
    .nonempty({ message: "Tên đăng nhập không được để trống" })
    .min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự" })
    .max(50, { message: "Tên đăng nhập không được quá 50 ký tự" }),
  fullName: z.string()
    .trim()
    .nonempty({ message: "Họ tên không được để trống" })
    .max(100, { message: "Họ tên không được quá 100 ký tự" }),
  password: z.string()
    .min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
    .optional()
    .or(z.literal('')),
  role: z.string()
    .nonempty({ message: "Vui lòng chọn vai trò" }),
  teamId: z.number()
    .int()
    .positive({ message: "ID nhóm phải là số dương" })
    .optional()
    .or(z.literal('').transform(() => undefined)),
  isActive: z.boolean()
});

export const productionOrderSchema = z.object({
  poNumber: z.string().trim().min(1, "Số PO không được để trống").max(50),
  productId: z.string().min(1, "Vui lòng chọn sản phẩm"),
  plannedQuantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
  notes: z.string().optional()
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"]
});

export const jobTaskSchema = z.object({
  taskId: z.string().trim().min(1, "Mã công việc không được để trống").max(50),
  poNumber: z.string().min(1, "Số PO không được để trống"),
  operationId: z.string().min(1, "Vui lòng chọn công đoạn"),
  sequence: z.number().min(1, "Thứ tự phải lớn hơn 0"),
  plannedQuantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  estimatedTime: z.number().min(0, "Thời gian ước tính phải >= 0"),
  assignedLine: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  notes: z.string().optional()
});

export const shiftAssignmentSchema = z.object({
  userId: z.string().min(1, "Vui lòng chọn người dùng"),
  shiftType: z.enum(['1', '2', '3'], { message: "Vui lòng chọn ca làm việc" }),
  assignedDate: z.string().min(1, "Vui lòng chọn ngày phân công"),
  workLine: z.string().optional(),
  notes: z.string().optional()
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ProductionRecordingFormData = z.infer<typeof productionRecordingSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type OperationFormData = z.infer<typeof operationSchema>;
export type DefectCodeFormData = z.infer<typeof defectCodeSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type ProductionOrderFormData = z.infer<typeof productionOrderSchema>;
export type JobTaskFormData = z.infer<typeof jobTaskSchema>;
export type ShiftAssignmentFormData = z.infer<typeof shiftAssignmentSchema>;