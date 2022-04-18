import { useEffect, useRef } from 'react';
import Selection from '@editablejs/selection'
import styles from './index.module.css'

export default function Docs() {
  const conatiner = useRef(null)

  useEffect(() => {
    if(!conatiner.current ) return
    new Selection({
      container: conatiner.current!,
    })
  },[])
  return (
    <div className={styles.wrapper}>
      <h1>Docs</h1>
      <div ref={conatiner} className={styles.container}>
        <div data-editable="true" data-key="1">塑料袋看风景看送到了附近岁的老父空间上岛咖啡了This is text</div>
        <div data-editable="true" data-key="2">送到了附近所带来狂风借多少疯掉了国际饭店了国家法定饿了高科技东方国际都反过来看 is text</div>
      </div>
    </div>
  );
}
