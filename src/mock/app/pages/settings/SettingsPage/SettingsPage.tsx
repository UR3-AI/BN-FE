import {
  EditIcon,
  NotificationsActiveIcon,
  PasskeyIcon,
  PhotoCameraIcon,
  SecurityIcon,
  VerifiedUserIcon,
} from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";
import useMeQuery from "@/mock/lib/apis/queries/auth/useMeQuery/useMeQuery";

const SettingsPage = () => {
  const { data, isLoading, error } = useMeQuery();

  if (isLoading) {
    return (
      <GlobalLayout
        topbarTitle="Settings"
        showSearch={false}>
        <div className="flex-1 flex items-center justify-center text-[1.4rem] text-on-surface-variant">
          Loading...
        </div>
      </GlobalLayout>
    );
  }

  if (error || !data) {
    return (
      <GlobalLayout
        topbarTitle="Settings"
        showSearch={false}>
        <div className="flex-1 flex items-center justify-center text-[1.4rem] text-error">
          데이터를 불러오지 못했습니다.
        </div>
      </GlobalLayout>
    );
  }

  return (
    <GlobalLayout
      topbarTitle="Settings"
      showSearch={false}>
      <div className="flex-1 overflow-y-auto p-[2.4rem] md:p-[4rem]">
        <div className="space-y-[4.8rem]">
          {/* Bento Layout */}
          <div className="grid grid-cols-1 gap-[3.2rem] lg:grid-cols-12">
            {/* Profile Settings */}
            <div className="space-y-[3.2rem] lg:col-span-8">
              <section className="rounded-[0.5rem] bg-surface-container-low p-[3.2rem] shadow-sm">
                <div className="mb-[4rem] flex flex-col items-start justify-between gap-[2.4rem] md:flex-row md:items-center">
                  <div className="flex items-center gap-[2.4rem]">
                    <div className="relative">
                      <div className="flex h-[9.6rem] w-[9.6rem] items-center justify-center rounded-[1.6rem] bg-surface-container-highest ring-4 ring-primary/10">
                        <span className="font-headline text-[3.2rem] font-bold text-primary">AR</span>
                      </div>
                      <button
                        type="button"
                        className="absolute -bottom-[0.8rem] -right-[0.8rem] flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-[0.25rem] bg-primary text-on-primary shadow-lg transition-transform active:scale-90">
                        <PhotoCameraIcon size="1.8rem" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-headline text-[2.4rem] font-bold text-on-surface">
                        Alex Rivera
                      </h3>
                      <p className="text-[1.4rem] text-secondary/70">
                        Senior Knowledge Architect
                      </p>
                      <div className="mt-[1.2rem]">
                        <span className="rounded-[0.125rem] bg-primary/10 px-[0.8rem] py-[0.2rem] text-[1rem] font-bold uppercase tracking-[0.15em] text-primary">
                          Premium Member
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-[0.125rem] bg-primary px-[2.4rem] py-[1rem] font-semibold text-on-primary shadow-md transition-colors hover:bg-primary-container active:scale-95">
                    Save Changes
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-x-[3.2rem] gap-y-[2.4rem] md:grid-cols-2">
                  <div className="space-y-[0.8rem]">
                    <label
                      htmlFor="settings-name"
                      className="pl-[0.4rem] text-[1.2rem] font-semibold uppercase tracking-[0.15em] text-secondary">
                      Display Name
                    </label>
                    <input
                      id="settings-name"
                      type="text"
                      defaultValue="Alex Rivera"
                      className="w-full rounded-t-[0.125rem] border-0 border-b-2 border-outline-variant/20 bg-surface-container-highest px-[1.6rem] py-[1.2rem] text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-0"
                    />
                  </div>
                  <div className="space-y-[0.8rem]">
                    <label
                      htmlFor="settings-email"
                      className="pl-[0.4rem] text-[1.2rem] font-semibold uppercase tracking-[0.15em] text-secondary">
                      Email Address
                    </label>
                    <input
                      id="settings-email"
                      type="email"
                      defaultValue={data.email}
                      className="w-full rounded-t-[0.125rem] border-0 border-b-2 border-outline-variant/20 bg-surface-container-highest px-[1.6rem] py-[1.2rem] text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-0"
                    />
                  </div>
                  <div className="space-y-[0.8rem] md:col-span-2">
                    <label
                      htmlFor="settings-bio"
                      className="pl-[0.4rem] text-[1.2rem] font-semibold uppercase tracking-[0.15em] text-secondary">
                      Biography
                    </label>
                    <textarea
                      id="settings-bio"
                      rows={3}
                      defaultValue="Structuring digital thoughts through the Cognitive Canvas lens. Focused on semantic networks and deep work productivity."
                      className="w-full resize-none rounded-t-[0.125rem] border-0 border-b-2 border-outline-variant/20 bg-surface-container-highest px-[1.6rem] py-[1.2rem] text-on-surface transition-all focus:border-primary focus:outline-none focus:ring-0"
                    />
                  </div>
                </div>
              </section>

              {/* Security */}
              <section className="rounded-[0.5rem] bg-surface-container-low p-[3.2rem] shadow-sm">
                <h3 className="mb-[2.4rem] flex items-center gap-[0.8rem] font-headline text-[1.8rem] font-bold text-on-surface">
                  <SecurityIcon size="2.4rem" fill="#ffe2ab" />
                  Security & Access
                </h3>
                <div className="space-y-[1.6rem]">
                  <div className="group flex cursor-pointer items-center justify-between rounded-[0.25rem] bg-surface-container p-[1.6rem] transition-colors hover:bg-surface-bright">
                    <div className="flex items-center gap-[1.6rem]">
                      <PasskeyIcon size="2.4rem" fill="#9fd0cd" />
                      <div>
                        <p className="text-[1.4rem] font-medium text-on-surface">
                          Change Password
                        </p>
                        <p className="text-[1.2rem] text-secondary/60">
                          Last updated 3 months ago
                        </p>
                      </div>
                    </div>
                    <span className="text-secondary/40 transition-colors group-hover:text-primary">
                      ›
                    </span>
                  </div>
                  <div className="group flex cursor-pointer items-center justify-between rounded-[0.25rem] bg-surface-container p-[1.6rem] transition-colors hover:bg-surface-bright">
                    <div className="flex items-center gap-[1.6rem]">
                      <VerifiedUserIcon size="2.4rem" fill="#9fd0cd" />
                      <div>
                        <p className="text-[1.4rem] font-medium text-on-surface">
                          Two-Factor Authentication
                        </p>
                        <p className="text-[1.2rem] font-medium text-secondary">
                          Currently Enabled
                        </p>
                      </div>
                    </div>
                    <span className="text-secondary/40 transition-colors group-hover:text-primary">
                      ›
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Preferences (Side Card) */}
            <div className="space-y-[3.2rem] lg:col-span-4">
              <section className="flex h-full flex-col overflow-hidden rounded-[0.5rem] bg-surface-container-low shadow-sm">
                <div className="bg-surface-container-highest/30 p-[2.4rem]">
                  <h3 className="flex items-center gap-[0.8rem] font-headline text-[1.8rem] font-bold text-primary">
                    <NotificationsActiveIcon size="2.4rem" fill="#ffe2ab" />
                    Preferences
                  </h3>
                  <p className="mt-[0.4rem] text-[1.2rem] text-secondary/70">
                    Manage how you receive updates
                  </p>
                </div>
                <div className="space-y-[3.2rem] p-[2.4rem]">
                  {/* Push Notifications */}
                  <div className="space-y-[1.6rem]">
                    <p className="mb-[0.8rem] text-[1rem] font-bold uppercase tracking-[0.2em] text-secondary">
                      Push Notifications
                    </p>
                    {[
                      { label: "Mentions & Comments", checked: true },
                      { label: "Node Connections", checked: true },
                      { label: "System Updates", checked: false, disabled: true },
                    ].map(({ label, checked, disabled }) => (
                      <div
                        key={label}
                        className={`flex items-center justify-between ${disabled ? "opacity-50" : ""}`}>
                        <span className="text-[1.4rem] text-on-surface">{label}</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={checked}
                          aria-label={label}
                          disabled={disabled}
                          className={`relative inline-flex h-[2rem] w-[4rem] items-center rounded-full ${checked ? "bg-secondary-container" : "bg-surface-container-highest"} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                          <div className={`absolute h-[1.6rem] w-[1.6rem] rounded-full transition-all ${checked ? "left-[2.2rem] bg-secondary" : "left-[0.2rem] bg-secondary/30"}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Email Digests */}
                  <div className="space-y-[1.6rem]">
                    <p className="mb-[0.8rem] text-[1rem] font-bold uppercase tracking-[0.2em] text-secondary">
                      Email Digests
                    </p>
                    {[
                      { label: "Weekly Summary", checked: true },
                      { label: "Product Tips", checked: false },
                    ].map(({ label, checked }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between">
                        <span className="text-[1.4rem] text-on-surface">{label}</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={checked}
                          aria-label={label}
                          className={`relative inline-flex h-[2rem] w-[4rem] cursor-pointer items-center rounded-full ${checked ? "bg-primary-container/30" : "bg-surface-container-highest"}`}>
                          <div className={`absolute h-[1.6rem] w-[1.6rem] rounded-full transition-all ${checked ? "left-[2.2rem] bg-primary" : "left-[0.2rem] bg-primary/40"}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Quiet Hours */}
                  <div className="border-t border-outline-variant/10 pt-[2.4rem]">
                    <div className="rounded-[0.25rem] border border-outline-variant/5 bg-surface-container p-[1.6rem]">
                      <p className="mb-[0.8rem] text-[1.2rem] font-medium text-on-surface">
                        Quiet Hours
                      </p>
                      <div className="flex items-center gap-[0.8rem]">
                        <span className="text-[1rem] text-secondary/60">From</span>
                        <span className="font-mono text-[1.2rem] text-primary">22:00</span>
                        <span className="text-[1rem] text-secondary/60">to</span>
                        <span className="font-mono text-[1.2rem] text-primary">08:00</span>
                        <button
                          type="button"
                          className="ml-auto text-secondary hover:text-primary">
                          <EditIcon size="1.6rem" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Danger Zone */}
          <section className="rounded-[0.5rem] border border-error/10 bg-error-container/5 p-[3.2rem]">
            <div className="flex flex-col items-start justify-between gap-[2.4rem] md:flex-row md:items-center">
              <div>
                <h4 className="mb-[0.4rem] font-headline font-bold text-error">
                  Danger Zone
                </h4>
                <p className="text-[1.4rem] text-on-surface-variant">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                type="button"
                className="rounded-[0.125rem] border border-error/30 px-[2.4rem] py-[0.8rem] font-semibold text-error transition-all hover:bg-error hover:text-on-error active:scale-95">
                Delete Account
              </button>
            </div>
          </section>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default SettingsPage;
