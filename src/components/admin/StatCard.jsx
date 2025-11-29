import React from 'react';
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, icon: Icon, trend, trendUp, className, gradient }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-6 bg-white/5 backdrop-blur-sm border border-white/10",
      className
    )}>
      {gradient && (
        <div className={cn("absolute inset-0 opacity-20", gradient)} />
      )}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-xl",
            gradient || "bg-white/10"
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <span className={cn(
              "text-sm font-medium px-2 py-1 rounded-full",
              trendUp ? "text-green-400 bg-green-500/20" : "text-red-400 bg-red-500/20"
            )}>
              {trendUp ? "+" : ""}{trend}
            </span>
          )}
        </div>
        <p className="text-white/60 text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}