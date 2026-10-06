import styles from './Card.module.css'

import type { CardProps } from './types'

export const CardHeader = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`${styles.cardHeader} ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardTitle = ({ children, className = '', ...props }: CardProps) => {
  return (
    <h3 className={`${styles.cardTitle} ${className}`} {...props}>
      {children}
    </h3>
  )
}

export const CardDescription = ({ children, className = '', ...props }: CardProps) => {
  return (
    <p className={`${styles.cardDescription} ${className}`} {...props}>
      {children}
    </p>
  )
}

export const CardContent = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`${styles.cardContent} ${className}`} {...props}>
      {children}
    </div>
  )
}

export const CardFooter = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`${styles.cardFooter} ${className}`} {...props}>
      {children}
    </div>
  )
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {children}
    </div>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
