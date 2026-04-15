"use client";

import { useActionState } from "react";
import { updateProfileAction, changePasswordAction } from "@/app/actions/settings";

export function SettingsForm({
  user,
}: {
  user: { name: string; bio: string | null; avatarUrl: string | null; email: string; username: string };
}) {
  const [prof, profAction, profPending] = useActionState(updateProfileAction, undefined);
  const [pwd, pwdAction, pwdPending] = useActionState(changePasswordAction, undefined);

  return (
    <div className="space-y-10">
      <form action={profAction} className="space-y-4 card p-6">
        <h2 className="text-lg font-bold">Profile</h2>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" value={user.email} disabled className="input opacity-60" />
          <p className="mt-1 text-xs text-muted">Email cannot be changed in the current version.</p>
        </div>
        <div>
          <label className="label" htmlFor="username">Username</label>
          <input id="username" value={user.username} disabled className="input opacity-60" />
        </div>
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={user.name} required minLength={2} maxLength={80} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" defaultValue={user.bio ?? ""} maxLength={500} rows={3} className="input resize-y" />
        </div>
        <div>
          <label className="label" htmlFor="avatarUrl">Avatar URL</label>
          <input id="avatarUrl" name="avatarUrl" type="url" defaultValue={user.avatarUrl ?? ""} className="input" />
        </div>
        {prof?.ok && <p className="text-sm text-teal">Profile updated.</p>}
        {prof?.error && <p className="text-sm text-danger">{prof.error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={profPending} className="btn-primary">
            {profPending ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>

      <form action={pwdAction} className="space-y-4 card p-6">
        <h2 className="text-lg font-bold">Change password</h2>
        <div>
          <label className="label" htmlFor="current">Current password</label>
          <input id="current" name="current" type="password" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="next">New password</label>
          <input id="next" name="next" type="password" required minLength={8} className="input" />
        </div>
        {pwd?.ok && <p className="text-sm text-teal">Password updated.</p>}
        {pwd?.error && <p className="text-sm text-danger">{pwd.error}</p>}
        <div className="flex justify-end">
          <button type="submit" disabled={pwdPending} className="btn-primary">
            {pwdPending ? "Updating..." : "Update password"}
          </button>
        </div>
      </form>
    </div>
  );
}
