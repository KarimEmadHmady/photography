import SectionBox from '../../../components/admin/SectionBox';
import { inputCls, labelCls } from '../../../components/admin/styles';
import { PriceType } from '../../../components/admin/types';
import { ServiceFormValues, SetServiceField } from '../types/service.types';

interface Props {
  values: ServiceFormValues;
  setField: SetServiceField;
}

export default function ServicePriceSection({ values, setField }: Props) {
  return (
    <SectionBox title="السعر">
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 items-end">
        <div className="space-y-1.5">
          <label className={labelCls}>نوع السعر</label>
          <select
            value={values.priceType}
            onChange={(e) => setField('priceType', e.target.value as PriceType)}
            className={inputCls}
          >
            <option value="fixed">سعر محدد</option>
            <option value="starting_from">يبدأ من</option>
            <option value="on_request">حسب الطلب</option>
          </select>
        </div>
        {values.priceType !== 'on_request' && (
          <div className="space-y-1.5">
            <label className={labelCls}>المبلغ (جنيه)</label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              required
              value={values.priceAmount}
              onChange={(e) => setField('priceAmount', e.target.value)}
              className={inputCls}
            />
          </div>
        )}
      </div>
    </SectionBox>
  );
}