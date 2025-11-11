import { Space, Tag } from 'antd';
import { useSelector } from 'react-redux';
import styles from './styles';

// let searchTag = 'All';

export default function AllTags() {
  const tags = useSelector((state) => state.tags);

  // const [isTagged, setIsTagged] = useState(true);
  let colors = [
    'magenta',
    'red',
    'volcano',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
  ];

  return (
    <div>
      <div style={styles.tags}>
        {tags.map((tag) => {
          let tagIndex = tags.indexOf(tag) % 10;

          return (
            <Space size={[0, 8]} wrap>
              <Tag color={colors[tagIndex]}>{tag}</Tag>
            </Space>
          );
        })}
      </div>
    </div>
  );
}
