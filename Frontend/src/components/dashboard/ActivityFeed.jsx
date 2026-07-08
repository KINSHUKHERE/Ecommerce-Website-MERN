import React from "react";
import { UserCheck, ShoppingCart, ShieldAlert, PackagePlus, Star } from "lucide-react";

const ActivityFeed = ({ activities }) => {
  const getIcon = (type) => {
    switch (type) {
      case "vendor":
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      case "order":
        return <ShoppingCart className="w-4 h-4 text-blue-600" />;
      case "product":
        return <PackagePlus className="w-4 h-4 text-cyan-600" />;
      case "review":
        return <Star className="w-4 h-4 text-amber-500" fill="currentColor" />;
      default:
        return <UserCheck className="w-4 h-4 text-purple-600" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "vendor":
        return "bg-emerald-50 border-emerald-100";
      case "order":
        return "bg-blue-50 border-blue-100";
      case "product":
        return "bg-cyan-50 border-cyan-100";
      case "review":
        return "bg-amber-50 border-amber-100";
      default:
        return "bg-purple-50 border-purple-100";
    }
  };

  return (
    <div className="bg-white border border-light-border/60 rounded-3xl p-5 shadow-2xs text-left w-full h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-extrabold text-dark-navy tracking-tight">
          Recent Activity Feed
        </h3>
        <p className="text-xs text-muted-gray mt-0.5 font-medium mb-5">
          Live actions and log registers compiled across operations.
        </p>
      </div>

      <div className="space-y-4.5 w-full flex-1">
        {activities.length === 0 ? (
          <div className="w-full py-10 flex flex-col items-center justify-center border border-dashed border-light-border/80 rounded-2xl p-6 bg-slate-50/50">
            <span className="text-2xl mb-1">🔔</span>
            <p className="text-xs font-bold text-muted-gray text-center">No logs compiled yet</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-100 ml-3.5 pl-5 space-y-5">
            {activities.map((act, idx) => (
              <div key={idx} className="relative flex gap-3 text-left">
                {/* Visual marker dot */}
                <div className={`absolute -left-[30px] top-0.5 w-5 h-5 rounded-full border flex items-center justify-center shadow-2xs ${getBgColor(act.type)}`}>
                  {getIcon(act.type)}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-dark-navy leading-normal">
                    {act.message}
                  </h4>
                  <p className="text-[10px] text-muted-gray font-medium">
                    {new Date(act.timestamp).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
