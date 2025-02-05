using FordTube.VBrick.Wrapper.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FordTube.VBrick.Wrapper.Repositories
{
    public static class RestrictionsMapper
    {
        private static Dictionary<MarketsType, VbrickMappingsType> marketsMappings = new Dictionary<MarketsType, VbrickMappingsType>
        {
            { MarketsType.Central, VbrickMappingsType.CentralCategoryId },
            { MarketsType.GreatLakes, VbrickMappingsType.GreatLakesCategoryId },
            { MarketsType.Northeast, VbrickMappingsType.NortheastCategoryId },
            { MarketsType.Southeast, VbrickMappingsType.SoutheastCategoryId },
            { MarketsType.West, VbrickMappingsType.WestCategoryId }
        };

        private static Dictionary<UserRolesType, VbrickMappingsType> rolesMappings = new Dictionary<UserRolesType, VbrickMappingsType>
        {
            { UserRolesType.DealerPrincipal, VbrickMappingsType.DealerPrincipalCategoryId },
            { UserRolesType.FIManager, VbrickMappingsType.FIManagerCategoryId },
            { UserRolesType.PartsDept, VbrickMappingsType.PartsDeptCategoryId },
            { UserRolesType.PartsManager, VbrickMappingsType.PartsManagerCategoryId },
            { UserRolesType.SalesConFul, VbrickMappingsType.SalesConFulCategoryId },
            { UserRolesType.SalesConsultant, VbrickMappingsType.SalesConsultantCategoryId },
            { UserRolesType.SalesManager, VbrickMappingsType.SalesManagerCategoryId },
            { UserRolesType.ServiceBodyShopMgr, VbrickMappingsType.ServiceBodyShopMgrCategoryId },
            { UserRolesType.ServiceDept, VbrickMappingsType.ServiceDeptCategoryId },
            { UserRolesType.Technician, VbrickMappingsType.TechnicianCategoryId }
        };

        private static List<Tuple<string, UserRolesType>> cookiesRoles = new List<Tuple<string, UserRolesType>>
        {
            new Tuple<string, UserRolesType>("DEALER", UserRolesType.DealerPrincipal),//Dealer Principal
            new Tuple<string, UserRolesType>("DLRCH", UserRolesType.DealerPrincipal),//Dealer Principal
            new Tuple<string, UserRolesType>("GENMGR", UserRolesType.DealerPrincipal),//Dealer Principal
            new Tuple<string, UserRolesType>("OTHDLR", UserRolesType.DealerPrincipal),//Dealer Principal
            new Tuple<string, UserRolesType>("CDTMGR", UserRolesType.FIManager),//F&I Manager
            new Tuple<string, UserRolesType>("CONTRL", UserRolesType.FIManager),//F&I Manager
            new Tuple<string, UserRolesType>("F&IMGR", UserRolesType.FIManager),//F&I Manager
            new Tuple<string, UserRolesType>("DOESII", UserRolesType.PartsDept),//Parts Dept.
            new Tuple<string, UserRolesType>("OTHPTS", UserRolesType.PartsDept),//Parts Dept.
            new Tuple<string, UserRolesType>("PTSAPP", UserRolesType.PartsDept),//Parts Dept.
            new Tuple<string, UserRolesType>("PTSCTR", UserRolesType.PartsDept),//Parts Dept.
            new Tuple<string, UserRolesType>("PTSCTS", UserRolesType.PartsDept),//Parts Dept.
            new Tuple<string, UserRolesType>("PTSCTW", UserRolesType.PartsDept),//Parts Dept.
            new Tuple<string, UserRolesType>("PTSGEN", UserRolesType.PartsDept),//Parts Dept.
            new Tuple<string, UserRolesType>("PTSKPR", UserRolesType.PartsDept),//Parts Dept.
            new Tuple<string, UserRolesType>("ACPTSM", UserRolesType.PartsManager),//Parts Manager
            new Tuple<string, UserRolesType>("APTSMG", UserRolesType.PartsManager),//Parts Manager
            new Tuple<string, UserRolesType>("PTSMGR", UserRolesType.PartsManager),//Parts Manager
            new Tuple<string, UserRolesType>("WPTSMG", UserRolesType.PartsManager),//Parts Manager
            new Tuple<string, UserRolesType>("AOFCMG", UserRolesType.SalesConFul),//Sales Con Ful
            new Tuple<string, UserRolesType>("BDCCRD", UserRolesType.SalesConFul),//Sales Con Ful
            new Tuple<string, UserRolesType>("BDCMGR", UserRolesType.SalesConFul),//Sales Con Ful
            new Tuple<string, UserRolesType>("SLSCLTFV", UserRolesType.SalesConFul),//Sales Con Ful
            new Tuple<string, UserRolesType>("ACCTNT", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("ALL", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("AMSLSC", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("APPADM", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("APPREC", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("ARNTMG", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("CASHR", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("CDTAGT", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("CRDAUT", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("CVSCLT", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("DLVPER", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("EU_FCADM", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("EU_FPADM", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("EU_FPUSR", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("FLTQCP", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("FMSTER", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("FSTARC", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("INTCRD", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("INTMGR", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("OFCACC", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("OFCEMP", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("OFCGEN", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("OFCSLS", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("OTHADM", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("OTHCDT", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("OTHCRD", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("OTHSLS", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("OTHSYS", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("QCSTDC", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("R3/5", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("RALL", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("RFQCP", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("RFTALL", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("RFTMGR", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("RMSTER", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("RNWLSP", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("RPSA", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("RQCP", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("RQCQP", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("SECR", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("SLSCLT", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("SLSTRN", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("SMEBCC", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("SMELBS", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("SMEMTS", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("SMESAA", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("SMEUSE", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("SYSAST", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("SYSPRG", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("TELOPR", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("TRNCRD", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("TTLCLK", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("VANADM", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("VANADV", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("VANAPP", UserRolesType.SalesConsultant),//Sales Consultant
            new Tuple<string, UserRolesType>("ADVMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("ASLSMG", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("BUSMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("CAMBPN", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("FLAMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("FLSMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("HRMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("JUNDLR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("OCMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("OFCMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("RNTMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("SLSMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("SMEAFT", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("SMECVM", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("SMECVS", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("SMEFLS", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("SMEGSM", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("SMESAM", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("SMEUCS", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("SYSMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("VANMGR", UserRolesType.SalesManager),//Sales Manager
            new Tuple<string, UserRolesType>("APTCRD", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("ATCCSR", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("CRCOOR", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("CTSADV", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("DISPAT", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("OTHSVC", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("PORTER", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("PREDLR", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("QLNCSR", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("SVCADM", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("SVCADV", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("SVCGEN", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("TIRESP", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("WRNCLK", UserRolesType.ServiceDept),//Service Dept.
            new Tuple<string, UserRolesType>("ASVCMG", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("ATCMGR", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("BSPMGR", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("CRMGR", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("CTSMGR", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("FLSVCM", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("PTSSDR", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("QLNMGR", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("SHPFMN", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("SVCGAR", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("SVCMGR", UserRolesType.ServiceBodyShopMgr),//Service/Body Shop Mgr
            new Tuple<string, UserRolesType>("ABSPMG", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("APPTEC", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("ATCTEC", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("BSPADM", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("BSPADV", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("BSPAPP", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("BSPPNT", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("BSPPTE", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("BSPTEC", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("CRGTEC", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("CTSTEC", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("OTHBSP", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("QLNTEC", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("SVCLDR", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("SVCMEC", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("SVCTEC", UserRolesType.Technician),//Technician
            new Tuple<string, UserRolesType>("VANTEC", UserRolesType.Technician)//Technician
        };

        public static VbrickMappingsType Map(MarketsType market)
        {
            return marketsMappings[market];
        }

        public static VbrickMappingsType Map(string role)
        {
            var userRole = cookiesRoles.Where(r => r.Item1 == role.ToUpper()).Select(r => r.Item2).FirstOrDefault();
            return rolesMappings[userRole];
        }
    }
}
