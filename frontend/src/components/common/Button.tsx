import React, { forwardRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import './Button.css';

export type ButtonVariant = 'orange' | 'save' | 'cancel' | 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children?: React.ReactNode;
}

export type ButtonAsButtonProps = BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
    to?: never;
  };

export type ButtonAsLinkProps = BaseButtonProps &
  Omit<LinkProps, 'size'> & {
    to: string;
    disabled?: boolean;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = 'orange',
      size = 'sm',
      className = '',
      children,
      ...restProps
    },
    ref
  ) => {
    const variantClass = variant === 'orange' ? 'btn-orange' : `btn-${variant}`;
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    const combinedClass = ['btn', variantClass, sizeClass, className].filter(Boolean).join(' ');

    if ('to' in restProps && typeof restProps.to === 'string') {
      const { to, disabled, onClick, ...linkProps } = restProps as ButtonAsLinkProps;

      if (disabled) {
        return (
          <span
            ref={ref as React.ForwardedRef<HTMLSpanElement>}
            className={`${combinedClass} disabled`}
            aria-disabled="true"
            role="link"
          >
            {children}
          </span>
        );
      }

      return (
        <Link
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          to={to}
          className={combinedClass}
          onClick={onClick}
          {...linkProps}
        >
          {children}
        </Link>
      );
    }

    const { type = 'button', disabled, ...buttonProps } = restProps as ButtonAsButtonProps;

    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        type={type}
        className={combinedClass}
        disabled={disabled}
        {...buttonProps}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
