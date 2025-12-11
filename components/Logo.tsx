import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 768 768" 
      className={className}
      aria-label="Logo Wspólnoty Aleja Śliwowa 26-32"
      role="img"
    >
      <defs>
        <style>{`
          .logo-primary { fill: #0f3b58; }
          .logo-text { fill: #0f3b58; font-family: Inter, Arial, sans-serif; }
        `}</style>
      </defs>
      
      {/* Roof */}
      <path className="logo-primary" d="M128 256 L384 96 L640 256 L640 288 L384 128 L128 288 Z"/>
      
      {/* Buildings group */}
      <g className="logo-primary">
        {/* Left tall building */}
        <rect x="208" y="288" width="144" height="256" rx="8"/>
        {/* Middle building */}
        <path d="M368 304 L496 256 L592 304 L592 544 L464 544 L464 336 L368 376 Z"/>
        {/* Small right annex */}
        <rect x="528" y="448" width="96" height="128" rx="8"/>
        
        {/* Windows - w oryginalnym kodzie dziedziczą kolor główny. 
            Dla czytelności na logo, ustawiamy je jako "wycięte" (białe/przezroczyste tło).
            Jeśli mają być ciemne, usuń fill="#ffffff".
        */}
        <g fill="#ffffff">
          <rect x="232" y="336" width="28" height="40"/>
          <rect x="272" y="336" width="28" height="40"/>
          <rect x="232" y="392" width="28" height="40"/>
          <rect x="272" y="392" width="28" height="40"/>
          <rect x="404" y="392" width="28" height="40"/>
          <rect x="444" y="392" width="28" height="40"/>
          <rect x="404" y="448" width="28" height="40"/>
          <rect x="444" y="448" width="28" height="40"/>
          <rect x="552" y="488" width="36" height="52"/>
        </g>
      </g>
      
      {/* Text: AŚ26-32 */}
      <text className="logo-text" x="384" y="640" fontSize="120" textAnchor="middle" letterSpacing="2">AŚ26-32</text>
      
      {/* Text: ALEJA ŚLIWOWA 26-32 */}
      <text className="logo-text" x="384" y="708" fontSize="56" textAnchor="middle">ALEJA ŚLIWOWA 26-32</text>
    </svg>
  );
};