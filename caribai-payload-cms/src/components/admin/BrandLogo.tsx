const logoSrc = '/CariAI-LOGO-Transparent.png'

function LogoWording() {
  return (
    <div className="caribai-admin-logo__wording">
      <span className="caribai-admin-logo__eyebrow">Content Management System</span>
      <span className="caribai-admin-logo__title">CaribAI Admin</span>
    </div>
  )
}

export function AdminLogo() {
  return (
    <div className="caribai-admin-logo caribai-admin-logo--large">
      <img alt="CaribAI" src={logoSrc} />
      <LogoWording />
    </div>
  )
}

export function AdminIcon() {
  return (
    <img alt="CaribAI" src={logoSrc} />
  )
}
