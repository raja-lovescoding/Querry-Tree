# Mathematical Equations Rendering Example

This document demonstrates how the fixed regex handles mathematical equations with headings and formatting.

## Chebyshev's Inequality Explained

The probability that a random data point ($X$) is *more than or equal to* $k$ standard deviations ($k\sigma$) away from the mean ($\mu$) is *less than or equal to* $1/k^2$.

### Core Formula

$$P(|X - \mu| \geq k\sigma) \leq \frac{1}{k^2}$$

### Understanding Each Component

- **$X$**: This represents a random variable (the data point you're observing from your "mystery box").
- **$\mu$ (mu)**: This is the *mean* (average) of your data. It's the center point of your distribution.
- **$\sigma$ (sigma)**: This is the *standard deviation*, which measures the typical spread or dispersion of your data around the mean.
- **$k$**: This is any positive real number greater than 1. It represents the number of standard deviations away from the mean that we're interested in.
- **$|X - \mu|$**: This is the absolute difference between a data point and the mean. It tells you how far a data point is from the average, regardless of whether it's above or below.
- **$P(\dots)$**: This denotes the *probability* of the event inside the parentheses occurring.

### Plain Language Explanation

**The first formula says**: The probability that a random data point ($X$) is *more than or equal to* $k$ standard deviations ($k\sigma$) away from the mean ($\mu$) is *less than or equal to* $1/k^2$.

**The second (equivalent) formula says**: The probability that a random data point ($X$) is *less than* $k$ standard deviations ($k\sigma$) away from the mean ($\mu$) is *greater than or equal to* $1 - 1/k^2$.

## Key Features Demonstrated

- **Inline math**: Variables like $X$, $\mu$, and $\sigma$ render smoothly within text
- **Block equations**: Full formulas like the main inequality display properly
- **Headings**: All heading levels work with math rendering
- **Bold text**: **Important terms** combine with equations
- **Mixed content**: Paragraphs, lists, and equations all work together

## Additional Examples

### Variance Formula

$$\sigma^2 = E[(X - \mu)^2]$$

### Z-Score

The z-score is calculated as: $z = \frac{X - \mu}{\sigma}$

### Standard Error

When sampling, the standard error of the mean is: $SE = \frac{\sigma}{\sqrt{n}}$

Where $n$ is the sample size.

## Benefits of This Implementation

- ✓ Equations render with proper mathematical typography
- ✓ Works seamlessly with Markdown headings
- ✓ Compatible with bold, italic, and other formatting
- ✓ Maintains performance with efficient parsing
- ✓ Graceful fallback for invalid LaTeX expressions
