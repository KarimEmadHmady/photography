import { IRegion } from '../../../types';
import { inputCls, labelCls } from '../../../components/admin/styles';
import { LocationFormValues, SetFormField } from '../types/location.types';
   import SectionBox from '../../../components/admin/SectionBox';
interface Props {
    values: LocationFormValues;
    setField: SetFormField;
    onNameChange: (val: string) => void;
    regions: IRegion[];
}

export default function BasicInfoSection({ values, setField, onNameChange, regions }: Props) {
    return (
        <SectionBox title="البيانات الأساسية">
            <div className="space-y-1.5">
                <label className={labelCls}>المنطقة التابع لها المكان *</label>
                <select
                    required
                    value={values.regionId}
                    onChange={(e) => setField('regionId', e.target.value)}
                    className={inputCls}
                >
                    <option value="" disabled>
                        -- اختر المنطقة --
                    </option>
                    {regions.map((reg) => (
                        <option key={reg._id} value={reg._id}>
                            {reg.name} ({reg.slug})
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                    <label className={labelCls}>اسم مكان التصوير *</label>
                    <input
                        type="text"
                        required
                        value={values.name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="حديقة الطفل - مدينة نصر"
                        className={inputCls}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className={labelCls}>الرابط المخصص (Slug) *</label>
                    <input
                        type="text"
                        required
                        value={values.slug}
                        onChange={(e) => setField('slug', e.target.value.toLowerCase())}
                        placeholder="child-park-nasr-city"
                        dir="ltr"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        className={`${inputCls} font-mono`}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                    <label className={labelCls}>العنوان بالتفصيل</label>
                    <input
                        type="text"
                        value={values.address}
                        onChange={(e) => setField('address', e.target.value)}
                        placeholder="شارع مكرم عبيد، المنطقة السادسة"
                        className={inputCls}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className={labelCls}>رابط خرائط Google (اختياري)</label>
                    <input
                        type="url"
                        inputMode="url"
                        value={values.mapUrl}
                        onChange={(e) => setField('mapUrl', e.target.value)}
                        placeholder="https://maps.google.com/..."
                        dir="ltr"
                        autoCapitalize="none"
                        className={inputCls}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className={labelCls}>وصف قصير للبطاقة</label>
                <input
                    type="text"
                    value={values.shortDescription}
                    onChange={(e) => setField('shortDescription', e.target.value)}
                    placeholder="مساحات خضراء شاسعة وبحيرات صناعية مميزة للتصوير"
                    className={inputCls}
                />
            </div>

            <div className="space-y-1.5">
                <label className={labelCls}>الوصف الكامل للمكان</label>
                <textarea
                    rows={3}
                    value={values.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="تفاصيل مواعيد الدخول، الإضاءة، أفضل زوايا التصوير..."
                    className={inputCls}
                />
            </div>
        </SectionBox>
    );
}