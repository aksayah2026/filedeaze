import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { categoryApi } from "../api/categoryApi";
import { serviceApi } from "../api/serviceApi";
import { Loader2, Plus, Edit2, Trash2, Settings as SettingsIcon, Package, Layers } from "lucide-react";
import { toast } from "react-hot-toast";

export function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'categories' | 'services'>('categories');

  const { data: categories, isLoading: loadingCats } = useQuery('categories', categoryApi.getAll, {
    select: (res) => res.data
  });

  const { data: services, isLoading: loadingServices } = useQuery('services', serviceApi.getAll, {
    select: (res) => res.data
  });

  const deleteCatMutation = useMutation(categoryApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
      toast.success('Category deleted');
    }
  });

  const deleteServiceMutation = useMutation(serviceApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
      toast.success('Service deleted');
    }
  });

  if (loadingCats || loadingServices) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Settings</h2>
          <p className="text-slate-400 mt-2">Manage service catalog and application configuration.</p>
        </div>
      </div>

      <div className="flex gap-4 p-1 bg-white/5 w-fit rounded-2xl border border-white/5">
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          <Layers className="w-4 h-4" />
          Categories
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'services' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          <Package className="w-4 h-4" />
          Services
        </button>
      </div>

      {activeTab === 'categories' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((cat) => (
            <Card key={cat.categoryId} className="bg-[#0f172a]/40 backdrop-blur-sm border-white/5 rounded-[2.5rem] group hover:border-sky-500/40 transition-all">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                    <Layers className="w-6 h-6 text-sky-500" />
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteCatMutation.mutate(cat.categoryId)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{cat.categoryName}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{cat.description}</p>
              </CardContent>
            </Card>
          ))}
          <button className="h-full min-h-[160px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-sky-500 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all group">
            <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-wider">Add Category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services?.map((service) => (
            <Card key={service.serviceId} className="bg-[#0f172a]/40 backdrop-blur-sm border-white/5 rounded-[2.5rem] group hover:border-purple-500/40 transition-all">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Package className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteServiceMutation.mutate(service.serviceId)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{service.serviceName}</h3>
                <div className="flex items-center gap-2 mb-4">
                   <span className="text-emerald-500 font-bold text-lg">${service.price}</span>
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">Fixed Rate</span>
                </div>
                <p className="text-slate-400 text-sm line-clamp-2">{service.description}</p>
              </CardContent>
            </Card>
          ))}
          <button className="h-full min-h-[200px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-purple-500 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all group">
            <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-sm uppercase tracking-wider">Add Service</span>
          </button>
        </div>
      )}
    </div>
  );
}
