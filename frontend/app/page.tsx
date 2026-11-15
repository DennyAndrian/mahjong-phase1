import Link from 'next/link';
export default function Home() {
  return <main className="landing"><div className="landing-card"><div className="eyebrow">A CLASSIC TABLE, REIMAGINED</div><div className="landing-symbol">麻將</div><h1>Mahjong</h1><p>Create a private room and invite friends to play together.</p><Link className="start-button" href="/game">Create a room <span>→</span></Link><div className="landing-note">Chinese Mahjong · 136 tiles · Up to 4 players</div></div></main>;
}
