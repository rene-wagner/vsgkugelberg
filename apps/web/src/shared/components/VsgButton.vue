<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  variant?: ButtonVariant;
  size?: ButtonSize;
  glow?: boolean;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  glow: false,
  ariaLabel: undefined,
});

const baseClasses = 'font-display tracking-wider transition-colors';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary bg-vsg-gold-400 text-vsg-blue-900 hover:bg-vsg-gold-300',
  secondary: 'bg-vsg-blue-900 text-vsg-gold-400 hover:bg-vsg-blue-800 transition-colors',
  outline: 'border-2 border-vsg-gold-400/50 text-vsg-gold-400 hover:bg-vsg-gold-400/10 transition-colors',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-6 py-2 text-lg',
  lg: 'px-10 py-4 text-2xl',
};

const glowClass = props.glow ? (props.variant === 'primary' ? 'gold-glow' : 'blue-glow') : '';
</script>

<template>
  <button :class="[baseClasses, variantClasses[variant], sizeClasses[size], glowClass]" :aria-label="ariaLabel">
    <slot />
  </button>
</template>
