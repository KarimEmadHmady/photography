import { inputCls, labelCls } from '../../../components/admin/styles';
import { LocationFormValues, PriceType, SetFormField } from '../types/location.types';
   import SectionBox from '../../../components/admin/SectionBox';

interface PriceRowProps {
    typeLabel: string;
    amountLabel: string;
    type: PriceType;
    amount: number | string;
    onTypeChange: (t: PriceType) => void;
    onAmountChange: (v: string) => void;
}

function PriceRow({
    typeLabel,
    amountLabel,
    type,
    amount,
    onTypeChange,
    onAmountChange,
}: PriceRowProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
                <label className={labelCls}>{typeLabel}</label>
                <select
                    value={type}
                    onChange={(e) => onTypeChange(e.target.value as PriceType)}
                    className={inputCls}
                >
                    <option value="fixed">سعر ثابت (Fixed)</option>
                    <option value="starting_from">يبدأ من (Starting from)</option>
                    <option value="on_request">حسب الاتفاق (On request)</option>
                </select>
            </div>
            {type !== 'on_request' && (
                <div className="space-y-1.5">
                    <label className={labelCls}>{amountLabel}</label>
                    <input
                        type="number"
                        inputMode="numeric"
                        min="1"
                        required
                        value={amount}
                        onChange={(e) => onAmountChange(e.target.value)}
                        className={inputCls}
                    />
                </div>
            )}
        </div>
    );
}

interface Props {
    values: LocationFormValues;
    setField: SetFormField;
}

export default function PricingSection({ values, setField }: Props) {
    return (
        <SectionBox title="تفاصيل الأسعار (يتم تخزين كل سعر بشكل مستقل)">
            <PriceRow
                typeLabel="نوع سعر جلسة التصوير"
                amountLabel="مبلغ سعر التصوير (جنيه)"
                type={values.photoPriceType}
                amount={values.photoAmount}
                onTypeChange={(t) => setField('photoPriceType', t)}
                onAmountChange={(v) => setField('photoAmount', v)}
            />

            <PriceRow
                typeLabel="نوع سعر حجز المكان / القاعة"
                amountLabel="مبلغ حجز المكان (جنيه)"
                type={values.venuePriceType}
                amount={values.venueAmount}
                onTypeChange={(t) => setField('venuePriceType', t)}
                onAmountChange={(v) => setField('venueAmount', v)}
            />

            <label className="flex items-start gap-2.5 cursor-pointer pt-1 min-h-[44px] sm:min-h-0">
                <input
                    type="checkbox"
                    checked={values.showTotal}
                    onChange={(e) => setField('showTotal', e.target.checked)}
                    className="w-5 h-5 sm:w-4 sm:h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500 shrink-0"
                />
                <span className="text-xs text-gray-700 font-medium leading-relaxed">
                    عرض إجمالي التكلفة التقديرية للعميل (إذا كان السعران معلومين)
                </span>
            </label>
        </SectionBox>
    );
}