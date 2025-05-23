import classes from './Tag.module.scss'

const Tag = ({name} : {name: string}): JSX.Element => {
  return (
    <div className={classes.tag}>
        <p>{name}</p>
    </div>
  )
}

export default Tag