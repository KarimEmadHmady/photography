import { inputCls, labelCls } from '../../../components/admin/styles';
import { ServiceFormValues, SetServiceField } from '../types/service.types';

interface Props {
  values: ServiceFormValues;
  setField: SetServiceField;
  onNameChange: (val: string) => void;
}

export default function ServiceBasicFields({ values, setField, onNameChange }: Props) {
  return (
    <>
      <div className="space-y-1.5">
        <label className={labelCls}>اسم الخدمة *</label>
        <input
          type="text"
          required
          value={values.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="ألبوم صور زفاف فاخر"
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
          placeholder="luxury-wedding-album"
          dir="ltr"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className={`${inputCls} font-mono`}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>وصف قصير للبطاقة</label>
        <input
          type="text"
          value={values.shortDescription}
          onChange={(e) => setField('shortDescription', e.target.value)}
          placeholder="ألبوم مطبوع بجودة عالية وغلاف جلدي مخصص"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelCls}>الوصف الكامل</label>
        <textarea
          rows={3}
          value={values.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="تفاصيل عدد الصفحات، خامات الطباعة، مدة التسليم..."
          className={inputCls}
        />
      </div>
    </>
  );
}