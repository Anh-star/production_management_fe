import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'success' | 'warning' | 'destructive' | 'neutral';
  icon: LucideIcon;
  description?: string;
  target?: string | number;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  status = 'neutral',
  icon: Icon,
  description,
  target
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  const statusColors = {
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", statusColors[status])} />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {unit && (
              <span className="text-sm text-muted-foreground">{unit}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {trend && trendValue && (
                <>
                  <TrendIcon className={cn("h-3 w-3", trendColors[trend])} />
                  <span className={cn("text-xs font-medium", trendColors[trend])}>
                    {trendValue}
                  </span>
                </>
              )}
            </div>
            
            {target && (
              <Badge variant="secondary" className="text-xs">
                Mục tiêu: {target}
              </Badge>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;