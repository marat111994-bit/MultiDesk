import Link from "next/link";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function Card({ children, className = "", onClick, href }: CardProps) {
  const baseStyles =
    "bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6";
  const classes = `${baseStyles} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}
