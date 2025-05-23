import classes from './CodeBlock.module.scss'

const CodeBlock = ({ children }: { children: JSX.Element }) => {
    return (
        <pre className={classes.code}>
            <code>
                {children}
            </code>
        </pre>
    )
}

export default CodeBlock