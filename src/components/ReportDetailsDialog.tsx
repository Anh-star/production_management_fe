import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ProductionReport } from '@/hooks/useProductionReports';
import { User, FileText, AlertTriangle, List, Clock, Undo2 } from 'lucide-react';

interface ReportDetailsDialogProps {
  report: ProductionReport | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onRevertStatus: (reportId: number) => void;
}

export const ReportDetailsDialog: React.FC<ReportDetailsDialogProps> = ({
  report,
  isOpen,
  onOpenChange,
  onRevertStatus,
}) => {
  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <List className="w-6 h-6" />
            Chi tiết Báo cáo sản xuất #{report.id}
          </DialogTitle>
          <DialogDescription>
            Xem lại thông tin chi tiết của báo cáo sản xuất.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Lệnh sản xuất</Label>
              <p className="font-medium">{report.po_code}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Sản phẩm</Label>
              <p className="font-medium">{report.product_name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Công đoạn</Label>
              <p className="font-medium">{report.operation_name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Người thực hiện</Label>
              <p className="font-medium">{report.user_name || 'Unknown'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Ca làm việc</Label>
              <p className="font-medium">{report.shift_name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Dây chuyền/Máy</Label>
              <p className="font-medium">{report.line}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Bắt đầu</Label>
              <p className="font-medium">{new Date(report.started_at).toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Kết thúc</Label>
              <p className="font-medium">
                {report.ended_at ? new Date(report.ended_at).toLocaleString() : 'Chưa kết thúc'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Sản lượng OK</Label>
              <p className="font-medium text-green-600">{report.qty_ok}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Sản lượng NG</Label>
              <p className="font-medium text-red-600">{report.qty_ng}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-muted-foreground mt-1" />
            <div>
              <h4 className="font-semibold">Ghi chú</h4>
              <p className="text-sm text-muted-foreground italic">
                {report.note || 'Không có ghi chú.'}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-muted-foreground mt-1" />
            <div>
              <h4 className="font-semibold">Mã lỗi đã ghi nhận</h4>
              {report.defect_reports && report.defect_reports.length > 0 ? (
                <ul className="space-y-2 mt-2">
                  {report.defect_reports.map((dr, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium">{dr.defect_codes?.code}</span> - {dr.defect_codes?.name}
                      </div>
                      <Badge variant="destructive">SL: {dr.qty}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Không có lỗi nào được ghi nhận.</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          {report.ended_at && (
            <Button
              variant="outline"
              onClick={() => onRevertStatus(report.id)}
              className="flex items-center gap-2"
            >
              <Undo2 className="w-4 h-4" />
              Bỏ trạng thái hoàn thành
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
