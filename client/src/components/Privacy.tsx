import { NavLink } from 'react-router-dom'

const Privacy = () => {
  return <div className="page privacy">
    <div className="container">
      <article className="mod_privacy">
        <h2 className="title">Privacy policy</h2>

        <h3>What we collect</h3>
        <ul>
          <li><strong>Contact form:</strong> your name, email address and message.</li>
          <li><strong>Account:</strong> your username, email address and a securely hashed password.</li>
          <li><strong>Activity:</strong> the comments and scores you publish. Only your username is shown publicly, never your email.</li>
        </ul>

        <h3>Why we use it</h3>
        <p>Only to reply to your messages, let you sign in, and show your comments and scores on the site. We do not sell or share your data with third parties, and we do not send newsletters.</p>

        <h3>Storage</h3>
        <p>Messages are delivered by email and kept only as long as needed to reply. Account data is kept until you ask us to delete it. When you sign in, a session token is stored in your browser to keep you logged in; it is removed when you log out. We do not use advertising or tracking cookies.</p>

        <h3>Your rights</h3>
        <p>You can ask to access, correct or delete your data at any time through the <NavLink to="/contact">contact form</NavLink>.</p>
      </article>
    </div>
  </div>
}

export default Privacy
