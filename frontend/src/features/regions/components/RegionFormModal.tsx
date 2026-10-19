import AdminModal from '../../../components/admin/AdminModal';
import CoverImageField from '../../../components/admin/CoverImageField';
import { inputCls, labelCls } from '../../../components/admin/styles';
import { PublishStatus } from '../../../components/admin/StatusBadge';
import { useRegionForm } from '../hooks/useRegionForm';

type FormApi = ReturnType<typeof useRegionForm>;

export default function RegionFormModal({ form }: { form: FormApi }) {
    const { isOpen, editingRegion, submitting, formError, values, setField, changeName, close, submit } =
        form;

    if (!isOpen) return null;

    return (
        <AdminModal
            title={editingRegion ? 'تعديل بيانات المنطقة' : 'إضافة منطقة جديدة'}
            submitLabel={editingRegion ? 'حفظ التعديلات' : 'إنشاء المنطقة'}
            submitting={submitting}
            formError={formError}
            onClose={close}
            onSubmit={submit}
        >
            <div className="space-y-1.5">
                <label className={labelCls}>اسم المنطقة *</label>
                <input
                    type="text"
                    required
                    value={values.name}
                    onChange={(e) => changeName(e.target.value)}
                    placeholder="مثال: مدينة نصر"
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
                    placeholder="nasr-city"
                    dir="ltr"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className={`${inputCls} font-mono`}
                />
                <span className="text-[11px] text-gray-400 block">
                    أحرف إنجليزية صغيرة وأرقام وشرطات فقط (3-120 حرف)
                </span>
            </div>

            <div className="space-y-1.5">
                <label className={labelCls}>وصف المنطقة</label>
                <textarea
                    rows={3}
                    value={values.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="وصف مختصر للمنطقة ومواقع التصوير المتوفرة بها..."
                    className={inputCls}
                />
            </div>

            <CoverImageField
                label="صورة غلاف المنطقة"
                value={values.coverImage}
                alt={values.name}
                onChange={(url) => setField('coverImage', url)}
            />

            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
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
                        onChange={(e) => setField('status', e.target.value as PublishStatus)}
                        className={inputCls}
                    >
                        <option value="published">منشور للعامة</option>
                        <option value="draft">مسودة (غير معروض)</option>
                    </select>
                </div>
            </div>
        </AdminModal>
    );
}