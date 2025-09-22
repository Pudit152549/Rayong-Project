import { defineStore } from 'pinia'

export const useDataStore = defineStore('data', {
  state: () => ({
    // เก็บฟอร์มแบบ dynamic (array forms)
    forms: [
      {
        user: { firstname: "", lastname: "" },
        phone: "",
        note: ""
      }
    ],
    // รายการพนักงานที่เพิ่มเข้ามา (ในตาราง) TypeScript Generic Array
    employeeList: [] as Array<{
      firstname: string,
      lastname: string,
      phone: string,
      note: string
    }>,
    // ขนาดของฟอร์ม
    size: "medium",
    // กฎ validation สำหรับฟอร์ม (สำหรับการเพิ่มข้อมูล)
    rules: {
      "user.firstname": {
        required: true,
        message: "Please input firstname",
        trigger: ["input", "blur"]
      },
      "user.lastname": {
        required: true,
        message: "Please input lastname",
        trigger: ["input", "blur"]
      },
      phone: {
        required: true,
        message: "Please input phone number",
        trigger: ["input", "blur"]
      },
      note: {
        required: true,
        message: "Please input note",
        trigger: ["input", "blur"]
      }
    },
    // state สำหรับเก็บ index ของพนักงานที่เลือกแก้ไข
    selectedEmployeeIndex: null as number | null
  }),
  actions: {
    // เพิ่มฟอร์มใหม่ลงใน forms
    addForm() {
      this.forms.push({
        user: { firstname: "", lastname: "" },
        phone: "",
        note: ""
      });
    },
    // ลบฟอร์มที่ index ที่ระบุ
    removeForm(index: number) {
      this.forms.splice(index, 1);
    },
    // ลบข้อมูลพนักงานใน employeeList
    deleteRow(index: number) {
      this.employeeList.splice(index, 1);
    },
    // เพิ่มพนักงานใหม่จากข้อมูลฟอร์ม
    addEmployee(formData: { user: { firstname: string, lastname: string },phone: string, note: string }) {
      this.employeeList.push({
        firstname: formData.user.firstname,
        lastname: formData.user.lastname,
        phone: formData.phone,
        note: formData.note
      });
    },
    // Action สำหรับตั้งค่าพนักงานที่เลือกแก้ไข
    selectEmployee(index: number) {
      this.selectedEmployeeIndex = index;
    }
  }
});
