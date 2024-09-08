export default (className: string, variant: string[] = []) => (
    [className, ...variant.map(item => `${className}--${item}`)].join(' ')
)