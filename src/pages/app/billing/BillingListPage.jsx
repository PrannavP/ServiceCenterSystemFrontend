import useList from "../../../hooks/useList";
import '../../../styles/listpage.css';
import useAuthApi from "../../../api/useAuthApi";

const BillListPage = () => {
    const { callApi } = useAuthApi();

    const { List } = useList({
        print: true,
        title: "Bills",
        endpoint: "/api/billing/list",
        deleteEndpoint: "/api/billing/delete",
        getId: (item) => item.bill_id ?? item.id,
        deleteLabel: "this bill",

onEdit: async (item) => {
    const html = await callApi({
        url: `/api/billing/printbill/${item.bill_id}`,
        method: "GET",
    });

    if (!html) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Please allow pop-ups.");
        return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();

        printWindow.onafterprint = () => {
            printWindow.close();
        };
    };
},

        columns: [
            {
                key: "bill_id",
                label: "Bill Number"
            },
            {
                key: "customer_name",
                label: "Customer"
            },
            {
                key: "customer_address",
                label: "Address"
            },
            {
                key: "vehicle_number",
                label: "Vehicle Number"
            },
            {
                key: "payment_method",
                label: "Payment Method"
            },
            {
                key: "is_active",
                label: "Active"
            },
            {
                key: "created_at",
                label: "Created At"
            }
        ]
    });

    return <List />;
};

export default BillListPage;
