import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { FileText } from "lucide-react";

export const SettingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 p-6 bg-background min-h-full text-foreground">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your platform and account preferences</p>
      </div>

      {/* Quick Links */}
      <Card className="bg-card border-border p-6 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/owner/settings/invoice-template')}>
        <CardHeader className="px-0 pt-0 pb-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Invoice Template Settings
          </CardTitle>
        </CardHeader>
        <p className="text-xs text-muted-foreground">Customize your invoice design, add logo, signature, and payment details</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border p-6">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-sm font-bold">Platform Branding</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {[["Platform Name", "EMS Pro"], ["Support Email", "support@emspro.in"], ["Domain", "emspro.in"]].map(([l, v]) => (
              <div key={l}>
                <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-2">{l}</div>
                <Input defaultValue={v} className="bg-background border-border" />
              </div>
            ))}
            <Button className="bg-primary text-primary-foreground font-bold px-5 py-2 rounded-lg text-sm border-none shadow-lg mt-4 w-full md:w-auto">Save Changes</Button>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-sm font-bold">Owner Profile</CardTitle>
          </CardHeader>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-black shrink-0 shadow-lg">S</div>
            <div>
              <div className="text-lg font-bold">Siddhesh</div>
              <div className="text-sm text-muted-foreground">Platform Owner</div>
              <button className="text-[11px] font-bold text-primary mt-1 bg-primary/10 px-2 py-1 rounded hover:bg-primary/20">Change Photo</button>
            </div>
          </div>
          <div className="space-y-4">
            {[["Full Name", "Siddhesh Z"], ["Email", "siddhesh@emspro.in"], ["Phone", "+91 98765 43210"]].map(([l, v]) => (
              <div key={l}>
                <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-2">{l}</div>
                <Input defaultValue={v} className="bg-background border-border" />
              </div>
            ))}
            <Button className="bg-primary text-primary-foreground font-bold px-5 py-2 rounded-lg text-sm border-none shadow-lg mt-4 w-full md:w-auto">Update Profile</Button>
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-sm font-bold">Notifications</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {[
              ["New company signup", true],
              ["Payment received", true],
              ["Plan expiry alerts", true],
              ["Support ticket opened", false],
              ["Platform error alerts", true],
            ].map(([l, on]) => (
              <div key={l as string} className="flex justify-between items-center py-3 border-b border-border/50 last:border-0">
                <span className="text-sm text-muted-foreground">{l}</span>
                <div 
                  className={`w-10 h-5 rounded-full cursor-pointer relative transition-colors ${on ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-background absolute top-0.5 transition-all ${on ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <CardHeader className="px-0 pt-0 pb-6">
            <CardTitle className="text-sm font-bold">Security</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {[["Current Password", ""], ["New Password", ""], ["Confirm Password", ""]].map(([l]) => (
              <div key={l}>
                <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-2">{l}</div>
                <Input type="password" placeholder="••••••••" className="bg-background border-border" />
              </div>
            ))}
            <Button className="bg-primary text-primary-foreground font-bold px-5 py-2 rounded-lg text-sm border-none shadow-lg mt-4 w-full md:w-auto">Update Password</Button>
            
            <div className="mt-8 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <div className="text-sm text-red-500 font-bold mb-1 uppercase tracking-wider">⚠️ Danger Zone</div>
              <div className="text-xs text-muted-foreground mb-4">These actions are irreversible and will delete all platform data associated with this account.</div>
              <Button variant="destructive" className="bg-red-500/20 text-red-500 font-bold text-xs py-2 px-4 h-auto border-none hover:bg-red-500/30">Delete Platform Account</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
