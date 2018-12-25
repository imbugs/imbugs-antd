import styles from './index.less'
import classnames from 'classnames';
import map from 'lodash/map'

export default (props) => {
  const list = props.list || [];
  return <ol className={classnames(styles.beautify, {
    [styles.rect]: props.rect,
    [styles.rounded]: !props.rect,
    [styles.hover]: props.hover,
    [styles.rotate]: props.rotate
  })}>
    {map(list, (item, index) => <li>{item}</li>)}
  </ol>
}
