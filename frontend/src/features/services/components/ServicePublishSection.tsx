import SectionBox from '../../../components/admin/SectionBox';
import { PublishStatus } from '../../../components/admin/StatusBadge';
import { inputCls, labelCls } from '../../../components/admin/styles';
import { ServiceFormValues, SetServiceField } from '../types/service.types';

interface Props {
  values: ServiceFormValues;
  setField: SetServiceField;
}

export default function ServicePublishSection({ values, setField }: Props) {
  return (
    <SectionBox title="إعدادات النشر">
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className={labelCls}>حالة النشر</label>
          <select
            value={values.status}
            onChange={(e) => setField('status', e.target.value as PublishStatus)}
            className={inputCls}
          >
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>ترتيب الظهور</label>
          <input
            type="number"
            inputMode="numeric"
            value={values.sortOrder}
            onChange={(e) => setField('sortOrder', Number(e.target.value))}
            className={inputCls}
          />
        </div>
      </div>
    </SectionBox>
  );
}