


import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Interfaces ---
interface Item {
  id: string;
  name: string;
  partNumber: string;
  quantity: number;
  system: string;
  // Storing serial numbers might be complex for frontend simulation
  // Add placeholder if needed for specific tracking later
}

interface ItemRequest {
  id: string;
  itemId: string;
  itemName: string;
  quantityRequested: number;
  requesterName: string;
  ncrNumber: string;
  trainSetNumber: string;
  carNumber: string;
  remarks: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  approvedBy?: string;
  approvedTimestamp?: number;
  handedOverSerials?: { healthy: string[]; faulty: string[] };
}

interface Transaction {
    id: string;
    timestamp: number;
    type: 'in' | 'out';
    itemId: string;
    itemName: string;
    quantity: number;
    userId: string;
    requestId?: string; // Link to request for 'out'
}

type UserRole = 'requester' | 'storekeeper';

interface User {
  id: string;
  name: string;
  role: UserRole;
}

// --- Initial Data (Simulated - Replace with API calls) ---
const initialItems: Item[] = [
  // Traction Motor
  { id: 'item-tm-1', name: 'Traction Motor Complete', partNumber: 'MB-5117-A', quantity: 2, system: 'Traction Motor' },
  // Traction Inverter
  { id: 'item-ti-1', name: 'Power Unit Complete', partNumber: 'PWU-017A', quantity: 2, system: 'Traction Inverter' },
  { id: 'item-ti-2', name: 'No.1 Gate Circuit unit Complete', partNumber: 'CONU-049', quantity: 1, system: 'Traction Inverter' },
  { id: 'item-ti-3', name: 'No.2 Gate Circuit unit Complete', partNumber: 'CONU-050', quantity: 1, system: 'Traction Inverter' },
  { id: 'item-ti-4', name: 'No.1 Interface unit Complete', partNumber: 'IFU-062', quantity: 1, system: 'Traction Inverter' },
  { id: 'item-ti-5', name: 'No.2 Interface unit Complete', partNumber: 'IFU-063', quantity: 1, system: 'Traction Inverter' },
  // Auxiliary Power Supply
  { id: 'item-aps-1', name: 'APS Poer Unit Complete', partNumber: 'MS-F341A', quantity: 2, system: 'Auxiliary Power Supply' },
  { id: 'item-aps-2', name: 'Battery Charger Power Unit Complete', partNumber: 'MS-F342A', quantity: 2, system: 'Auxiliary Power Supply' },
  { id: 'item-aps-3', name: 'Circuit Module', partNumber: 'MS-2283', quantity: 2, system: 'Auxiliary Power Supply' },
  { id: 'item-aps-4', name: 'Gate Power Supply', partNumber: 'NJD-8916', quantity: 2, system: 'Auxiliary Power Supply' },
  { id: 'item-aps-5', name: 'SG Module Complete', partNumber: 'SGU-032', quantity: 2, system: 'Auxiliary Power Supply' },
  { id: 'item-aps-6', name: 'ACC Module Complete', partNumber: 'ACCU-029', quantity: 2, system: 'Auxiliary Power Supply' },
  // TMS Equipment
  { id: 'item-tms-1', name: 'Central Control Unit (CU)', partNumber: 'MS-A1945', quantity: 1, system: 'TMS Equipment' },
  { id: 'item-tms-2', name: 'Communication Node1(For DTC)', partNumber: 'MS-A1946', quantity: 2, system: 'TMS Equipment' },
  { id: 'item-tms-3', name: 'Communication Node2(For MC)', partNumber: 'MS-A1948', quantity: 2, system: 'TMS Equipment' },
  { id: 'item-tms-4', name: 'Remote I/O Unit(For DTC)', partNumber: 'MS-A1950', quantity: 2, system: 'TMS Equipment' },
  { id: 'item-tms-5', name: 'Remote I/O Unit(For MC)', partNumber: 'MS-A1952', quantity: 2, system: 'TMS Equipment' },
  { id: 'item-tms-6', name: 'Interface Unit', partNumber: 'MS-A1954', quantity: 1, system: 'TMS Equipment' },
  // Lighting System
  { id: 'item-ls-1', name: 'SALOON LIGHT 110VDC 1302MM', partNumber: 'TVN8502', quantity: 25, system: 'Lighting System' },
  { id: 'item-ls-2', name: 'SALOON LIGHT 110VDC 690MM', partNumber: 'TVN8503', quantity: 5, system: 'Lighting System' },
  { id: 'item-ls-3', name: 'LEDCARD 110VDC 48X0,2W 4000K -NT 12VDC 595MM', partNumber: 'TLL2754', quantity: 50, system: 'Lighting System' },
  { id: 'item-ls-4', name: 'DIFFUSER TVN8502 1291MM', partNumber: '1000-1353', quantity: 25, system: 'Lighting System' },
  { id: 'item-ls-5', name: 'DIFFUSER TVN8503 679MM', partNumber: '1000-1705', quantity: 5, system: 'Lighting System' },
  { id: 'item-ls-6', name: 'CONNECTOR 5 POLE/FEMALE', partNumber: 'LL709', quantity: 60, system: 'Lighting System' },
  { id: 'item-ls-7', name: 'LOCKING CLIP FOR WAGO WINSTA CONNECTOR WHITE', partNumber: 'LL708', quantity: 60, system: 'Lighting System' },
  // Current Collector
  { id: 'item-cc-1', name: 'Third Rail Current Collecto RH', partNumber: '7212452', quantity: 1, system: 'Current Collector' },
  { id: 'item-cc-2', name: 'Cable current collector fuse box', partNumber: '2213414', quantity: 2, system: 'Current Collector' },
  { id: 'item-cc-3', name: 'Collector Shoe support RH', partNumber: '1182142', quantity: 1, system: 'Current Collector' },
  { id: 'item-cc-4', name: 'Insulator RH', partNumber: '63823', quantity: 1, system: 'Current Collector' },
  { id: 'item-cc-5', name: 'Third Rail Current Collecto LH', partNumber: '7212483', quantity: 1, system: 'Current Collector' },
  // { id: 'item-cc-6', name: 'Collector Shoe support LH', partNumber: '2213414', quantity: 1, system: 'Current Collector' }, // Duplicate Part Number? Check data
  { id: 'item-cc-7', name: 'Insulator LH', partNumber: '64025', quantity: 1, system: 'Current Collector' },
  // Exterior Lighting
  { id: 'item-el-1', name: 'Head Light', partNumber: 'YSP2180', quantity: 2, system: 'Exterior Lighting' },
  { id: 'item-el-2', name: 'Marker & Tail Light', partNumber: 'YSP2181', quantity: 2, system: 'Exterior Lighting' },
  { id: 'item-el-3', name: 'Flasher Light', partNumber: 'YSP2177', quantity: 1, system: 'Exterior Lighting' },
  { id: 'item-el-4', name: 'DIL outside', partNumber: 'YSP2178', quantity: 8, system: 'Exterior Lighting' },
  { id: 'item-el-5', name: 'DIL inside', partNumber: 'YSP2179', quantity: 8, system: 'Exterior Lighting' },
  // VAC (Saloon)
  { id: 'item-vac-s-1', name: 'Compressor', partNumber: 'FT0053012-002', quantity: 4, system: 'VAC' },
  { id: 'item-vac-s-2', name: 'Vibration dampers for compressors', partNumber: 'FT0053012-003', quantity: 2, system: 'VAC' },
  { id: 'item-vac-s-3', name: 'Condenser (LH/RH)', partNumber: 'FT0053009-102', quantity: 1, system: 'VAC' },
  { id: 'item-vac-s-4', name: 'Condenser Fan assembly', partNumber: 'FT0053012-102', quantity: 3, system: 'VAC' },
  { id: 'item-vac-s-5', name: 'Filter dryer DML-085S', partNumber: '12.0700.0019', quantity: 4, system: 'VAC' },
  { id: 'item-vac-s-6', name: 'High pressure switch (22.5/18 bar)', partNumber: 'FT0053039-004', quantity: 4, system: 'VAC' },
  // ... (Continue adding all 394 items following the pattern)
  // ... (Example: Brake System)
  { id: 'item-brake-1', name: 'AIR FILTER', partNumber: 'I11775', quantity: 1, system: 'Brake system' },
  { id: 'item-brake-2', name: 'ANTI-SKID VALVE', partNumber: 'II88960/024', quantity: 2, system: 'Brake system' },
  // ... (Add all other items)
  // Sample item for testing quantity reduction
   { id: 'item-test-1', name: 'Test Item A', partNumber: 'TEST-001', quantity: 10, system: 'Testing' },
   { id: 'item-test-2', name: 'Test Item B', partNumber: 'TEST-002', quantity: 5, system: 'Testing' },
];

const users: User[] = [
  { id: 'user-1', name: 'Shashi', role: 'requester' },
  { id: 'user-2', name: 'Arghya', role: 'requester' },
  { id: 'user-3', name: 'Sunil', role: 'requester' },
  { id: 'user-4', name: 'Shilpa', role: 'requester' },
  { id: 'user-5', name: 'Shirshendu', role: 'requester' },
  { id: 'user-6', name: 'Akhilesh', role: 'requester' },
  { id: 'user-7', name: 'Chandan', role: 'requester' },
  { id: 'user-8', name: 'Rahul', role: 'requester' },
  { id: 'user-9', name: 'Debtanu', role: 'storekeeper' },
  { id: 'user-10', name: 'Sahin', role: 'storekeeper' },
  { id: 'user-11', name: 'Sanjay', role: 'storekeeper' },
];

const trainSetNumbers = Array.from({ length: 17 }, (_, i) => `TS${String(i + 1).padStart(2, '0')}`);
const carNumbers = ['DMC1', 'TC1', 'MC1', 'MC2', 'TC2', 'DMC2'];

// --- Helper Functions ---
const generatePassword = (name: string): string => `${name}@1234`;

// --- Main Component ---
export default function KmrclInventoryTool() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<Item[]>(initialItems);
  const [itemRequests, setItemRequests] = useState<ItemRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemForRequest, setSelectedItemForRequest] = useState<Item | null>(null);
  const [requestFormData, setRequestFormData] = useState({
    quantity: 1,
    ncrNumber: '',
    trainSetNumber: trainSetNumbers[0],
    carNumber: carNumbers[0],
    remarks: '',
  });
  const [view, setView] = useState<'dashboard' | 'inventory' | 'requests' | 'manage_items'>('dashboard');
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState<ItemRequest | null>(null);
  const [serialNumbersFormData, setSerialNumbersFormData] = useState<{ healthy: string; faulty: string }>({ healthy: '', faulty: '' });
  const [newItemFormData, setNewItemFormData] = useState({ name: '', partNumber: '', quantity: 0, system: '' });

  // --- Simulated API/Backend Interaction (Replace with actual fetch calls) ---
  const fetchItems = async () => {
    console.log("Fetching items...");
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));
    setInventoryItems(initialItems); // In real app, fetch from backend/Google Sheet
  };

  const fetchRequests = async () => {
    console.log("Fetching requests...");
    await new Promise(resolve => setTimeout(resolve, 50));
    // In real app, fetch from backend/Google Sheet
    // For simulation, requests are managed in state
  };

   const fetchTransactions = async () => {
        console.log("Fetching transactions...");
        await new Promise(resolve => setTimeout(resolve, 50));
        // In real app, fetch from backend/Google Sheet
        // For simulation, transactions are managed in state
   };

  useEffect(() => {
    // Simulate initial data fetching
    fetchItems();
    fetchRequests();
    fetchTransactions();
  }, []);

  // --- Event Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const user = users.find(u => u.name === username);
    if (user && password === generatePassword(user.name)) {
      setLoggedInUser(user);
      setView('dashboard'); // Go to dashboard after login
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setUsername('');
    setPassword('');
    setLoginError(null);
    setView('dashboard'); // Reset view on logout
  };

  const handleRequestItem = (item: Item) => {
    setSelectedItemForRequest(item);
    // Reset form data for new request
    setRequestFormData({
        quantity: 1,
        ncrNumber: '',
        trainSetNumber: trainSetNumbers[0],
        carNumber: carNumbers[0],
        remarks: '',
    });
    setView('requests'); // Switch view or open modal
  };

  const handleRequestFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRequestFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, parseInt(value, 10) || 1) : value,
    }));
  };

 const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForRequest || !loggedInUser || loggedInUser.role !== 'requester') return;

    const requestedQuantity = requestFormData.quantity;
    if (requestedQuantity <= 0) {
        alert("Quantity must be greater than zero.");
        return;
    }
    if (requestedQuantity > selectedItemForRequest.quantity) {
      alert(`Requested quantity (${requestedQuantity}) exceeds available stock (${selectedItemForRequest.quantity}).`);
      return;
    }

    const newRequest: ItemRequest = {
      id: `req-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      itemId: selectedItemForRequest.id,
      itemName: selectedItemForRequest.name,
      quantityRequested: requestedQuantity,
      requesterName: loggedInUser.name,
      ncrNumber: requestFormData.ncrNumber,
      trainSetNumber: requestFormData.trainSetNumber,
      carNumber: requestFormData.carNumber,
      remarks: requestFormData.remarks,
      status: 'pending',
      timestamp: Date.now(),
    };

    setItemRequests(prev => [...prev, newRequest]);
    setSelectedItemForRequest(null); // Close the form/modal
    setView('inventory'); // Go back to inventory list or dashboard
    alert('Request submitted successfully!');
    // TODO: Update Google Sheet "Requests"
  };

  const handleSelectRequestForApproval = (request: ItemRequest) => {
    setSelectedRequestForApproval(request);
    setSerialNumbersFormData({ healthy: '', faulty: '' }); // Reset serials form
  };

  const handleApproveRequest = () => {
    if (!selectedRequestForApproval || !loggedInUser || loggedInUser.role !== 'storekeeper') return;

    const itemIndex = inventoryItems.findIndex(item => item.id === selectedRequestForApproval.itemId);
    if (itemIndex === -1) {
        alert("Error: Requested item not found in inventory.");
        setSelectedRequestForApproval(null); // Clear selection
        return;
    }

    const currentItem = inventoryItems[itemIndex];
    const requestedQuantity = selectedRequestForApproval.quantityRequested;

    if (currentItem.quantity < requestedQuantity) {
        alert(`Error: Not enough stock available for ${currentItem.name}. Available: ${currentItem.quantity}, Requested: ${requestedQuantity}`);
        // Optionally reject the request here or just show error
        // setItemRequests(prev => prev.map(req => req.id === selectedRequestForApproval.id ? { ...req, status: 'rejected' } : req));
        // setSelectedRequestForApproval(null);
        return;
    }

     // Parse serial numbers
    const healthySerials = serialNumbersFormData.healthy.split(/[\s,]+/).filter(Boolean);
    const faultySerials = serialNumbersFormData.faulty.split(/[\s,]+/).filter(Boolean);
    const totalSerialsEntered = healthySerials.length + faultySerials.length;

    // Basic validation: Ensure number of serials matches requested quantity
    // More complex validation might be needed in a real scenario (e.g., checking if serials exist)
    if (totalSerialsEntered !== requestedQuantity) {
        alert(`Please enter exactly ${requestedQuantity} serial numbers (healthy + faulty). You entered ${totalSerialsEntered}.`);
        return;
    }


    // 1. Update Request Status and add serials
    const updatedRequests = itemRequests.map(req =>
      req.id === selectedRequestForApproval.id
        ? { ...req, status: 'approved' as const, approvedBy: loggedInUser.name, approvedTimestamp: Date.now(), handedOverSerials: { healthy: healthySerials, faulty: faultySerials } }
        : req
    );
    setItemRequests(updatedRequests);

    // 2. Update Inventory Quantity
    const updatedInventory = [...inventoryItems];
    updatedInventory[itemIndex] = {
      ...currentItem,
      quantity: currentItem.quantity - requestedQuantity,
    };
    setInventoryItems(updatedInventory);

    // 3. Log Transaction
    const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        timestamp: Date.now(),
        type: 'out',
        itemId: currentItem.id,
        itemName: currentItem.name,
        quantity: requestedQuantity,
        userId: loggedInUser.id,
        requestId: selectedRequestForApproval.id
    };
    setTransactions(prev => [...prev, newTransaction]);


    console.log(`Approved request ${selectedRequestForApproval.id}, Reduced quantity of ${currentItem.name} by ${requestedQuantity}`);
    alert(`Request approved. ${currentItem.name} quantity updated. Serial numbers recorded.`);

    setSelectedRequestForApproval(null); // Close the approval section

    // TODO: Update Google Sheet "Requests" (status, approver, timestamp, serials)
    // TODO: Update Google Sheet "Inventory" (quantity)
    // TODO: Update Google Sheet "Transactions"
  };

   const handleRejectRequest = (requestId: string) => {
        if (!loggedInUser || loggedInUser.role !== 'storekeeper') return;
        setItemRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'rejected' } : req));
        // TODO: Update Google Sheet "Requests" (status)
        alert('Request rejected.');
         if (selectedRequestForApproval?.id === requestId) {
            setSelectedRequestForApproval(null);
        }
   };

   const handleNewItemFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       const { name, value } = e.target;
       setNewItemFormData(prev => ({
           ...prev,
           [name]: name === 'quantity' ? Math.max(0, parseInt(value, 10) || 0) : value,
       }));
   };

   const handleAddNewItem = (e: React.FormEvent) => {
       e.preventDefault();
       if (!loggedInUser || loggedInUser.role !== 'storekeeper') return;
       if (!newItemFormData.name || !newItemFormData.partNumber || !newItemFormData.system || newItemFormData.quantity <= 0) {
           alert("Please fill all fields and provide a quantity greater than 0.");
           return;
       }

       const newItem: Item = {
           id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
           name: newItemFormData.name.trim(),
           partNumber: newItemFormData.partNumber.trim(),
           quantity: newItemFormData.quantity,
           system: newItemFormData.system.trim(),
       };

       setInventoryItems(prev => [...prev, newItem]);

        // Log Transaction (Check-in)
       const newTransaction: Transaction = {
           id: `txn-${Date.now()}`,
           timestamp: Date.now(),
           type: 'in',
           itemId: newItem.id,
           itemName: newItem.name,
           quantity: newItem.quantity,
           userId: loggedInUser.id,
       };
       setTransactions(prev => [...prev, newTransaction]);


       setNewItemFormData({ name: '', partNumber: '', quantity: 0, system: '' }); // Reset form
       alert("New item added successfully!");
       // TODO: Update Google Sheet "Inventory" (add row)
       // TODO: Update Google Sheet "Transactions"
   };

   const handleRemoveItem = (itemId: string) => {
        if (!loggedInUser || loggedInUser.role !== 'storekeeper') return;

        const itemToRemove = inventoryItems.find(item => item.id === itemId);
        if (!itemToRemove) return;

        if (window.confirm(`Are you sure you want to remove "${itemToRemove.name}"? This action cannot be undone.`)) {
            setInventoryItems(prev => prev.filter(item => item.id !== itemId));
             // Consider logging this removal if needed, maybe as a special transaction type
             alert(`Item "${itemToRemove.name}" removed.`);
             // TODO: Update Google Sheet "Inventory" (remove row)
        }
   };

  // --- Filtered Data ---
  const filteredItems = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(lowerSearchTerm) ||
      item.partNumber.toLowerCase().includes(lowerSearchTerm) ||
      item.system.toLowerCase().includes(lowerSearchTerm)
    );
  }, [inventoryItems, searchTerm]);

  const pendingRequests = useMemo(() => {
    return itemRequests.filter(req => req.status === 'pending');
  }, [itemRequests]);

  const completedRequests = useMemo(() => {
    return itemRequests.filter(req => req.status !== 'pending');
  }, [itemRequests]);

   // --- Chart Data ---
    const systemInventoryData = useMemo(() => {
        const systemCounts: { [key: string]: number } = {};
        inventoryItems.forEach(item => {
            systemCounts[item.system] = (systemCounts[item.system] || 0) + item.quantity;
        });
        return Object.entries(systemCounts).map(([name, quantity]) => ({ name, quantity }));
    }, [inventoryItems]);

    const transactionActivityData = useMemo(() => {
        // Aggregate transactions by day (example)
        const dailyActivity: { [key: string]: { in: number; out: number } } = {};
        transactions.forEach(txn => {
            const date = new Date(txn.timestamp).toLocaleDateString();
            if (!dailyActivity[date]) {
                dailyActivity[date] = { in: 0, out: 0 };
            }
            if (txn.type === 'in') {
                dailyActivity[date].in += txn.quantity;
            } else {
                dailyActivity[date].out += txn.quantity;
            }
        });
         return Object.entries(dailyActivity)
            .map(([date, counts]) => ({ date, In: counts.in, Out: counts.out }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date
    }, [transactions]);


  // --- Render Logic ---

  // Login Screen
  if (!loggedInUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-200 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">KMRCL Store Inventory</h1>
          <p className="text-center text-gray-500 mb-8">Metro Rail Project</p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g., Shashi)"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g., Name@1234)"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-xs italic mb-4">{loginError}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main Application View
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white p-5 flex flex-col shadow-lg">
         <div className="flex items-center mb-8">
             <div className="bg-blue-500 p-2 rounded-full mr-3">
                 {/* Placeholder Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
             </div>
            <h2 className="text-xl font-semibold">KMRCL Inventory</h2>
        </div>
        <ul className="space-y-3">
           <li>
                <button onClick={() => setView('dashboard')} className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition duration-150 ${view === 'dashboard' ? 'bg-blue-600' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                </button>
            </li>
          <li>
            <button onClick={() => setView('inventory')} className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition duration-150 ${view === 'inventory' ? 'bg-blue-600' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10m16-10v10M6 7h12M6 17h12M6 12h12m-8-5l4 4-4 4" />
                </svg>
                View Inventory
            </button>
          </li>
          {loggedInUser.role === 'requester' && (
             <li>
                <button onClick={() => setView('requests')} className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition duration-150 ${view === 'requests' ? 'bg-blue-600' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    My Requests
                </button>
            </li>
          )}
          {loggedInUser.role === 'storekeeper' && (
            <>
              <li>
                 <button onClick={() => setView('requests')} className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition duration-150 ${view === 'requests' ? 'bg-blue-600' : ''}`}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                     </svg>
                     Manage Requests
                     {pendingRequests.length > 0 && (
                         <span className="ml-2 inline-block py-0.5 px-1.5 leading-none text-center whitespace-nowrap align-baseline font-bold bg-red-500 text-white rounded-full text-xs">{pendingRequests.length}</span>
                     )}
                 </button>
              </li>
              <li>
                <button onClick={() => setView('manage_items')} className={`w-full text-left px-4 py-2 rounded hover:bg-gray-700 transition duration-150 ${view === 'manage_items' ? 'bg-blue-600' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add/Remove Items
                </button>
              </li>
            </>
          )}
        </ul>
        <div className="mt-auto">
            <div className="border-t border-gray-700 pt-4 mb-4">
                <p className="text-sm text-gray-400">Logged in as:</p>
                <p className="font-semibold">{loggedInUser.name} ({loggedInUser.role})</p>
            </div>
            <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            >
                Logout
            </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 capitalize">{view.replace('_', ' ')}</h1>

        {/* --- Dashboard View --- */}
        {view === 'dashboard' && (
           <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Total Items</h3>
                        <p className="text-4xl font-bold text-blue-600">{inventoryItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
                         <p className="text-sm text-gray-500 mt-1">{inventoryItems.length} unique types</p>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Pending Requests</h3>
                        <p className="text-4xl font-bold text-orange-500">{pendingRequests.length}</p>
                         <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Items Out (Today)</h3>
                        <p className="text-4xl font-bold text-red-500">
                             {transactions.filter(t => t.type === 'out' && new Date(t.timestamp).toDateString() === new Date().toDateString()).reduce((sum, t) => sum + t.quantity, 0)}
                        </p>
                         <p className="text-sm text-gray-500 mt-1">Based on approved requests</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Items Low Stock</h3>
                         <p className="text-4xl font-bold text-yellow-500">
                            {inventoryItems.filter(item => item.quantity < 5).length}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Quantity less than 5</p>
                    </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Inventory by System Chart */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Inventory by System</h3>
                        {systemInventoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={systemInventoryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="quantity" fill="#3b82f6" name="Total Quantity"/>
                            </BarChart>
                        </ResponsiveContainer>
                         ) : (
                            <p className="text-gray-500 text-center py-10">No inventory data to display.</p>
                         )}
                    </div>

                     {/* Transaction Activity Chart */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">Daily Transaction Activity</h3>
                         {transactionActivityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={transactionActivityData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }}/>
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="In" fill="#22c55e" name="Items In"/>
                                <Bar dataKey="Out" fill="#ef4444" name="Items Out"/>
                            </BarChart>
                        </ResponsiveContainer>
                         ) : (
                              <p className="text-gray-500 text-center py-10">No transaction data to display.</p>
                          )}
                    </div>
               </div>
            </div>
        )}


        {/* --- Inventory View --- */}
        {view === 'inventory' && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by Name, Part No, or System..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-white shadow rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    {loggedInUser.role === 'requester' && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.length > 0 ? filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.partNumber}</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.system}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${item.quantity < 5 ? 'text-red-600' : 'text-green-600'}`}>{item.quantity}</td>
                      {loggedInUser.role === 'requester' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleRequestItem(item)}
                            disabled={item.quantity <= 0}
                            className={`text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out ${item.quantity > 0 ? '' : 'opacity-50'}`}
                           >
                            {item.quantity > 0 ? 'Request Item' : 'Out of Stock'}
                          </button>
                        </td>
                      )}
                    </tr>
                  )) : (
                     <tr>
                       <td colSpan={loggedInUser.role === 'requester' ? 5 : 4} className="text-center py-10 text-gray-500">
                         No items found matching your search criteria.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Requests View (Requester / Storekeeper) --- */}
         {view === 'requests' && (
            <div className="space-y-8">
                {/* --- Request Form (for Requester, when item is selected) --- */}
                {loggedInUser.role === 'requester' && selectedItemForRequest && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Request Item: <span className="text-blue-600">{selectedItemForRequest.name}</span></h2>
                    <p className="text-sm text-gray-600 mb-4">Available Quantity: {selectedItemForRequest.quantity}</p>
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                                <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={requestFormData.quantity}
                                onChange={handleRequestFormChange}
                                min="1"
                                max={selectedItemForRequest.quantity} // Set max based on availability
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                                />
                            </div>
                            <div>
                                <label htmlFor="ncrNumber" className="block text-sm font-medium text-gray-700">NCR Number</label>
                                <input
                                type="text"
                                id="ncrNumber"
                                name="ncrNumber"
                                value={requestFormData.ncrNumber}
                                onChange={handleRequestFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                                />
                            </div>
                             <div>
                                <label htmlFor="trainSetNumber" className="block text-sm font-medium text-gray-700">Train Set Number</label>
                                <select
                                id="trainSetNumber"
                                name="trainSetNumber"
                                value={requestFormData.trainSetNumber}
                                onChange={handleRequestFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                {trainSetNumbers.map(ts => <option key={ts} value={ts}>{ts}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="carNumber" className="block text-sm font-medium text-gray-700">Car Number</label>
                                <select
                                id="carNumber"
                                name="carNumber"
                                value={requestFormData.carNumber}
                                onChange={handleRequestFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                {carNumbers.map(cn => <option key={cn} value={cn}>{cn}</option>)}
                                </select>
                            </div>
                        </div>
                         <div>
                            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
                            <textarea
                            id="remarks"
                            name="remarks"
                            rows={3}
                            value={requestFormData.remarks}
                            onChange={handleRequestFormChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            ></textarea>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setSelectedItemForRequest(null)}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
                )}

                {/* --- Pending Requests List (Storekeeper) --- */}
                 {loggedInUser.role === 'storekeeper' && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Pending Requests ({pendingRequests.length})</h2>
                         {pendingRequests.length > 0 ? (
                         <ul className="divide-y divide-gray-200">
                            {pendingRequests.map(req => (
                            <li key={req.id} className="py-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="flex-1 mb-2 md:mb-0">
                                        <p className="text-sm font-medium text-indigo-600">{req.itemName} (Qty: {req.quantityRequested})</p>
                                        <p className="text-sm text-gray-500">Requester: {req.requesterName} | NCR: {req.ncrNumber}</p>
                                         <p className="text-sm text-gray-500">Train: {req.trainSetNumber} | Car: {req.carNumber}</p>
                                        <p className="text-xs text-gray-400">Requested: {new Date(req.timestamp).toLocaleString()}</p>
                                         {req.remarks && <p className="text-sm text-gray-600 mt-1 italic">Remarks: {req.remarks}</p>}
                                    </div>
                                    <div className="flex space-x-2">
                                         <button
                                            onClick={() => handleSelectRequestForApproval(req)}
                                            className="text-sm bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md transition duration-150"
                                        >
                                            Review & Approve
                                        </button>
                                         <button
                                            onClick={() => handleRejectRequest(req.id)}
                                            className="text-sm bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md transition duration-150"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                                {/* --- Approval Section (Serial Numbers) --- */}
                                {selectedRequestForApproval?.id === req.id && (
                                    <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-md space-y-3">
                                        <h4 className="font-semibold text-md text-green-800">Approve Request & Record Serials</h4>
                                         <p className="text-sm text-green-700">Enter serial numbers for the <span className="font-bold">{req.quantityRequested}</span> item(s) being handed over. Separate multiple serials with commas or spaces.</p>
                                        <div>
                                            <label htmlFor={`healthy-serials-${req.id}`} className="block text-sm font-medium text-gray-700">Healthy Item Serial Numbers:</label>
                                            <input
                                                type="text"
                                                id={`healthy-serials-${req.id}`}
                                                value={serialNumbersFormData.healthy}
                                                onChange={(e) => setSerialNumbersFormData(prev => ({ ...prev, healthy: e.target.value }))}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="e.g., HSN001, HSN002"
                                            />
                                        </div>
                                         <div>
                                            <label htmlFor={`faulty-serials-${req.id}`} className="block text-sm font-medium text-gray-700">Faulty Item Serial Numbers:</label>
                                            <input
                                                type="text"
                                                id={`faulty-serials-${req.id}`}
                                                value={serialNumbersFormData.faulty}
                                                onChange={(e) => setSerialNumbersFormData(prev => ({ ...prev, faulty: e.target.value }))}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="e.g., FSN003"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => setSelectedRequestForApproval(null)}
                                                className="text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-1 rounded-md transition duration-150"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleApproveRequest}
                                                className="text-sm bg-green-600 text-white hover:bg-green-700 px-3 py-1 rounded-md transition duration-150"
                                            >
                                                Confirm Approval & Handover
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                            ))}
                         </ul>
                         ) : (
                              <p className="text-gray-500 text-center py-5">No pending requests.</p>
                          )}
                    </div>
                 )}

                {/* --- Completed/My Requests List --- */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">
                         {loggedInUser.role === 'requester' ? 'My Request History' : 'Completed Requests'}
                         ({completedRequests.length})
                    </h2>
                    {completedRequests.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {/* Filter for requester's own requests if applicable */}
                            {completedRequests
                                .filter(req => loggedInUser.role === 'storekeeper' || req.requesterName === loggedInUser.name)
                                .sort((a, b) => (b.approvedTimestamp || b.timestamp) - (a.approvedTimestamp || a.timestamp)) // Sort by completion/request time
                                .map(req => (
                                <li key={req.id} className="py-4">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                         <div className="flex-1 mb-2 md:mb-0">
                                            <p className="text-sm font-medium text-gray-900">{req.itemName} (Qty: {req.quantityRequested})</p>
                                            <p className="text-sm text-gray-500">Requester: {req.requesterName} | NCR: {req.ncrNumber} | Train: {req.trainSetNumber} | Car: {req.carNumber}</p>
                                            <p className="text-xs text-gray-400">Requested: {new Date(req.timestamp).toLocaleString()}</p>
                                             {req.status === 'approved' && req.approvedTimestamp && (
                                                <p className="text-xs text-gray-400">Approved by {req.approvedBy} on {new Date(req.approvedTimestamp).toLocaleString()}</p>
                                             )}
                                             {req.remarks && <p className="text-sm text-gray-600 mt-1 italic">Remarks: {req.remarks}</p>}
                                              {req.status === 'approved' && req.handedOverSerials && (
                                                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                                                    <p><span className="font-semibold">Handed Over Serials:</span></p>
                                                    {req.handedOverSerials.healthy.length > 0 && <p>Healthy: {req.handedOverSerials.healthy.join(', ')}</p>}
                                                    {req.handedOverSerials.faulty.length > 0 && <p>Faulty: {req.handedOverSerials.faulty.join(', ')}</p>}
                                                </div>
                                              )}
                                        </div>
                                        <div>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800' // Should not happen here, but fallback
                                            }`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-5">No completed requests found.</p>
                    )}
                </div>
            </div>
        )}


       {/* --- Manage Items View (Storekeeper) --- */}
       {view === 'manage_items' && loggedInUser.role === 'storekeeper' && (
           <div className="space-y-8">
               {/* Add New Item Form */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Item</h2>
                    <form onSubmit={handleAddNewItem} className="space-y-4">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="newItemName" className="block text-sm font-medium text-gray-700">Item Name</label>
                                <input type="text" id="newItemName" name="name" value={newItemFormData.name} onChange={handleNewItemFormChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                            </div>
                             <div>
                                <label htmlFor="newItemPartNumber" className="block text-sm font-medium text-gray-700">Part Number</label>
                                <input type="text" id="newItemPartNumber" name="partNumber" value={newItemFormData.partNumber} onChange={handleNewItemFormChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                            </div>
                             <div>
                                <label htmlFor="newItemSystem" className="block text-sm font-medium text-gray-700">System</label>
                                <input type="text" id="newItemSystem" name="system" value={newItemFormData.system} onChange={handleNewItemFormChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., Traction Motor, VAC"/>
                            </div>
                             <div>
                                <label htmlFor="newItemQuantity" className="block text-sm font-medium text-gray-700">Initial Quantity</label>
                                <input type="number" id="newItemQuantity" name="quantity" value={newItemFormData.quantity} onChange={handleNewItemFormChange} min="1" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                            </div>
                       </div>
                        <div className="flex justify-end">
                            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                                Add Item to Inventory
                            </button>
                        </div>
                    </form>
                </div>

                 {/* Remove Item Section */}
                 <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Remove Existing Item</h2>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search item to remove..."
                            value={searchTerm} // Re-use search term for filtering
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                     <div className="max-h-96 overflow-y-auto border rounded-md">
                         <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part No</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.partNumber}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{item.quantity}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-600 hover:text-red-800 font-medium transition duration-150"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredItems.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-5 text-gray-500">No items match search.</td></tr>
                                )}
                            </tbody>
                         </table>
                     </div>
                 </div>
           </div>
        )}


      </main>
    </div>
  );
}
