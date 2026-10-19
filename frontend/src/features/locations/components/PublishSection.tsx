import { inputCls, labelCls } from '../../../components/admin/styles';
import { LocationFormValues, LocationStatus, SetFormField } from '../types/location.types';
   import SectionBox from '../../../components/admin/SectionBox';

interface Props {
    values: LocationFormValues;
    setField: SetFormField;
}

export default function PublishSection({ values, setField }: Props) {
    return (
        <SectionBox title="إعدادات النشر">
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3.5">
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
                <div className="space-y-1.5">
                    <label className={labelCls}>حالة النشر</label>
                    <select
                        value={values.status}
                        onChange={(e) => setField('status', e.target.value as LocationStatus)}
                        className={inputCls}
                    >
                        <option value="published">منشور</option>
                        <option value="draft">مسودة</option>
                    </select>
                </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer min-h-[44px] sm:min-h-0">
                <input
                    type="checkbox"
                    checked={values.isFeatured}
                    onChange={(e) => setField('isFeatured', e.target.checked)}
                    className="w-5 h-5 sm:w-4 sm:h-4 rounded text-amber-600 focus:ring-amber-500 shrink-0"
                />
                <span className="text-xs font-semibold text-gray-700">مكان مميز</span>
            </label>
        </SectionBox>
    );
}