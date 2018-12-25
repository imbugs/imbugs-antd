import styles from './index.css';
import BeautifyList from '../component/BeautifyList'
export default function(props) {
 return (
    <div style={{width: 200, marginLeft: 20}}>
      <BeautifyList list={['111', '222']} hover={true} rect={true}/>
    </div>
  );
}
