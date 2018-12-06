import styles from './index.css';
import DynamicTableForm from '../component/DynamicTableForm'
export default function(props) {
  const onChangeCron = (values)=>{
      console.log(values)
  }
  const columnsInfo = [{
      title: '姓名',
      key: 'name'
  },{
    title: 'Age',
    key: 'age'
  }]
  return (
    <div className={styles.normal}>
      <DynamicTableForm {...props}
        dataSource={[{name: 'imbugs',age: '1'}, {name: 'alipay',age: '10'}]}
        onChange={onChangeCron} columnsInfo={columnsInfo}/>
    </div>
  );
}
