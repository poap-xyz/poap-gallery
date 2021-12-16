import React, { useState } from 'react'
import BuiltOnEth from '../assets/images/built-on-eth.png'
import POAPLogo from '../assets/images/POAP.svg'
import TwitterLogo from '../assets/images/logo-twitter-grey.svg'
import TwitterLogoBlue from '../assets/images/logo-twitter-blue.svg'
import GithubLogo from '../assets/images/logo-github-grey.svg'
import GithubLogoBlue from '../assets/images/logo-github-blue.svg'
import TelegramLogo from '../assets/images/logo-telegram-grey.svg'
import TelegramLogoBlue from '../assets/images/logo-telegram-blue.svg'
import DiscordLogo from '../assets/images/logo-discord-grey.svg'
import DiscordLogoBlue from '../assets/images/logo-discord-blue.svg'
import RedditLogo from '../assets/images/logo-reddit-grey.svg'
import RedditLogoBlue from '../assets/images/logo-reddit-blue.svg'
import {POAP_APP_URL} from "../store/api";

export default function () {
  const [twitterHover, setTwitterHover] = useState(false)
  const [githubHover, setGithubHover] = useState(false)
  const [telegramHover, setTelegramHover] = useState(false)
  const [discordHover, setDiscordHover] = useState(false)
  const [redditHover, setRedditHover] = useState(false)
  return (
    <div style={{marginTop: 100}}>
    <hr className='footer-divider' />
    <footer className={`footer footer-grid`}>
      {/* FIX: 'a' elements generate a js error when hovered */}
      <a href="/" className="home-link"><img src={POAPLogo} alt="" /></a>
      <div className="ecosystem">
        <h4>POAP Ecosystem</h4>
        <a href="https://www.poap.xyz/" className="a" target="_blank"  rel="noopener noreferrer">poap.xyz</a>
        <a href="https://poap.fun/" className="b" target="_blank"  rel="noopener noreferrer">poap.fun</a>
        <a href="https://poap.chat/" className="c" target="_blank"  rel="noopener noreferrer">poap.chat</a>
        <a href="https://www.poap.gallery/" className="d" target="_blank"  rel="noopener noreferrer">poap.gallery</a>
        <a href="https://www.poap.delivery/" className="e" target="_blank"  rel="noopener noreferrer">poap.delivery</a>
        <a href={POAP_APP_URL} className="f" target="_blank"  rel="noopener noreferrer">poap.app</a>
        <a href="https://poap.vote/" className="g" target="_blank"  rel="noopener noreferrer">poap.vote</a>
        <a href="https://app.poap.art/" className="h" target="_blank"  rel="noopener noreferrer">poap.art</a>
      </div>
      <div className="join-links">
        <h4>Join our community!</h4>
        <div className="social-icons">
          <a href="https://twitter.com/poapxyz/" target="_blank"  rel="noopener noreferrer"><img onMouseEnter={() => setTwitterHover(true)} onMouseLeave={() => setTwitterHover(false)} src={twitterHover ? TwitterLogoBlue : TwitterLogo} alt="Twitter" /></a>
          <a href="https://github.com/poapxyz/poap" target="_blank"  rel="noopener noreferrer"><img onMouseEnter={() => setGithubHover(true)} onMouseLeave={() => setGithubHover(false)} src={githubHover ? GithubLogoBlue : GithubLogo} alt="Github" /></a>
          <a href="https://t.me/poapxyz" target="_blank"  rel="noopener noreferrer"><img onMouseEnter={() => setTelegramHover(true)} onMouseLeave={() => setTelegramHover(false)} src={telegramHover ? TelegramLogoBlue : TelegramLogo} alt="Telegram" /></a>
          <a href="https://discord.gg/fcxW4yR" target="_blank"  rel="noopener noreferrer"><img onMouseEnter={() => setDiscordHover(true)} onMouseLeave={() => setDiscordHover(false)} src={discordHover ? DiscordLogoBlue : DiscordLogo} alt="Discord" /></a>
          <a href="https://reddit.com/r/poap" target="_blank"  rel="noopener noreferrer"><img onMouseEnter={() => setRedditHover(true)} onMouseLeave={() => setRedditHover(false)} src={redditHover ? RedditLogoBlue : RedditLogo} alt="Reddit" /></a>
        </div>
      </div>
      <div className="eth-branding">
        <img src={BuiltOnEth} alt="Built on Ethereum" />
      </div>
    </footer>
    </div>
    );
}
