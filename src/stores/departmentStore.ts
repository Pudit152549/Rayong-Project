import { computed } from "vue";
import { useRoute } from "vue-router";

import { useHrDataStore } from "@/stores/HumanResource/data";
import { useIotDataStore } from "@/stores/IOT/data";

import type { RowData } from "@/stores/types";

export type DeptKey = "hr" | "iot";

export function useDeptStore() {
  const route = useRoute();

  const from = computed(() => (route.query.from as string) || "HrBoard");
  const deptKey = computed<DeptKey>(() => (route.query.deptKey as DeptKey) || "hr");

  // ✅ เรียก store ทั้งคู่ไว้ก่อน แล้วค่อยเลือก (ปลอดภัยกับ Pinia)
  const hrStore = useHrDataStore();
  const iotStore = useIotDataStore();

  const activeStore = computed(() => (deptKey.value === "iot" ? iotStore : hrStore));

  // (optional) label แผนก เอาไว้แสดงในหน้า/แจ้งเตือน
  const departmentLabel = computed(() => (deptKey.value === "iot" ? "IOT" : "Human Resource"));

  // (optional) type guard
  const ensureRowExists = computed<RowData | undefined>(() => undefined);

  return {
    from,
    deptKey,
    departmentLabel,
    hrStore,
    iotStore,
    activeStore,
    ensureRowExists
  };
}
