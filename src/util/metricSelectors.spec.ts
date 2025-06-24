import parsePrometheusTextFormat from "parse-prometheus-text-format";
import { getCpuUsage, getInstanceMetricReport } from "util/metricSelectors";
import type { LxdInstance } from "types/instance";

describe("parse instance metrics to a report", () => {
  it("parses correctly for virtual machine metrics", () => {
    const json = parsePrometheusTextFormat(vmMetrics);
    const instance = {
      name: "micro1",
      project: "microcloud",
    } as LxdInstance;

    const report = getInstanceMetricReport(json, instance);

    expect(report.memory?.free).toBe(23523328);
    expect(report.memory?.total).toBe(2080448512);
    expect(report.memory?.cached).toBe(140214272);

    expect(report.rootFilesystem?.device).toBe("/");
    expect(report.rootFilesystem?.free).toBe(4721631232);
    expect(report.rootFilesystem?.total).toBe(10213466112);

    expect(report.otherFilesystems[0].device).toBe("/dev/sda15");
    expect(report.otherFilesystems[0].free).toBe(103057408);
    expect(report.otherFilesystems[0].total).toBe(109395456);

    expect(report.otherFilesystems[1].device).toBe("tmpfs");
    expect(report.otherFilesystems[1].free).toBe(1048576);
    expect(report.otherFilesystems[1].total).toBe(1048576);
  });

  it("parses correctly for container metrics", () => {
    const json = parsePrometheusTextFormat(instanceMetrics);
    const instance = {
      name: "hopeful-hound",
      project: "default",
    } as LxdInstance;

    const report = getInstanceMetricReport(json, instance);

    expect(report.memory?.free).toBe(50098827264);
    expect(report.memory?.total).toBe(50209529856);
    expect(report.memory?.cached).toBe(62730240);

    expect(report.rootFilesystem?.device).toBe("/");
    expect(report.rootFilesystem?.free).toBe(271006957568);
    expect(report.rootFilesystem?.total).toBe(413676339200);

    expect(report.otherFilesystems.length).toBe(0);
  });

  it("parses correctly for container CPU metrics", () => {
    const json = parsePrometheusTextFormat(instanceMetrics);
    const instance = {
      name: "hopeful-hound",
      project: "default",
    } as LxdInstance;

    const cpuUsage = getCpuUsage({ time: 1, metric: json }, instance);

    expect(cpuUsage?.coreCount).toBe(12);
    expect(cpuUsage?.cpuSecondsIdle).toBe(0);
    expect(cpuUsage?.cpuSecondsTotal).toBe(938.2248920000001);
  });

  it("parses correctly for VM CPU metrics", () => {
    const json = parsePrometheusTextFormat(vmMetrics);
    const instance = {
      name: "micro1",
      project: "microcloud",
    } as LxdInstance;

    const cpuUsage = getCpuUsage({ time: 1, metric: json }, instance);

    expect(cpuUsage?.cpuSecondsTotal).toBe(19522.7);
    expect(cpuUsage?.cpuSecondsIdle).toBe(18822.159999999996);
  });
});

const vmMetrics = `
lxd_cpu_effective_total{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="0",mode="iowait",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 12.65
lxd_cpu_seconds_total{cpu="0",mode="irq",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="0",mode="idle",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9767.97
lxd_cpu_seconds_total{cpu="0",mode="nice",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0.98
lxd_cpu_seconds_total{cpu="0",mode="softirq",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.47
lxd_cpu_seconds_total{cpu="0",mode="steal",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 5.83
lxd_cpu_seconds_total{cpu="0",mode="system",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9.86
lxd_cpu_seconds_total{cpu="0",mode="user",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 11.65
lxd_cpu_seconds_total{cpu="1",mode="iowait",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 12.39
lxd_cpu_seconds_total{cpu="1",mode="irq",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="1",mode="idle",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9774.65
lxd_cpu_seconds_total{cpu="1",mode="nice",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0.24
lxd_cpu_seconds_total{cpu="1",mode="softirq",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.25
lxd_cpu_seconds_total{cpu="1",mode="steal",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 4.74
lxd_cpu_seconds_total{cpu="1",mode="system",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9.16
lxd_cpu_seconds_total{cpu="1",mode="user",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 11.74
lxd_cpu_seconds_total{cpu="2",mode="iowait",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 13.6
lxd_cpu_seconds_total{cpu="2",mode="irq",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="2",mode="idle",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9769.42
lxd_cpu_seconds_total{cpu="2",mode="nice",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.63
lxd_cpu_seconds_total{cpu="2",mode="softirq",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0.93
lxd_cpu_seconds_total{cpu="2",mode="steal",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 5.28
lxd_cpu_seconds_total{cpu="2",mode="system",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 10.06
lxd_cpu_seconds_total{cpu="2",mode="user",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 12.3
lxd_cpu_seconds_total{cpu="3",mode="iowait",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 14.49
lxd_cpu_seconds_total{cpu="3",mode="irq",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="3",mode="idle",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9769.33
lxd_cpu_seconds_total{cpu="3",mode="nice",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.35
lxd_cpu_seconds_total{cpu="3",mode="softirq",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.44
lxd_cpu_seconds_total{cpu="3",mode="steal",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 5.14
lxd_cpu_seconds_total{cpu="3",mode="system",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9.05
lxd_cpu_seconds_total{cpu="3",mode="user",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 13.1
lxd_cpu_seconds_total{cpu="0",mode="iowait",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 147.98
lxd_cpu_seconds_total{cpu="0",mode="irq",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="0",mode="idle",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 9365.62
lxd_cpu_seconds_total{cpu="0",mode="nice",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 5.69
lxd_cpu_seconds_total{cpu="0",mode="softirq",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 10.3
lxd_cpu_seconds_total{cpu="0",mode="steal",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 29.8
lxd_cpu_seconds_total{cpu="0",mode="system",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 92.5
lxd_cpu_seconds_total{cpu="0",mode="user",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 115.24
lxd_cpu_seconds_total{cpu="1",mode="iowait",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 160.32
lxd_cpu_seconds_total{cpu="1",mode="irq",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="1",mode="idle",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 9355.54
lxd_cpu_seconds_total{cpu="1",mode="nice",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 5.05
lxd_cpu_seconds_total{cpu="1",mode="softirq",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 12.1
lxd_cpu_seconds_total{cpu="1",mode="steal",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 29.98
lxd_cpu_seconds_total{cpu="1",mode="system",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 88.66
lxd_cpu_seconds_total{cpu="1",mode="user",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 111.34
lxd_cpu_seconds_total{cpu="0",mode="iowait",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 157.18
lxd_cpu_seconds_total{cpu="0",mode="irq",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="0",mode="idle",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 9384.21
lxd_cpu_seconds_total{cpu="0",mode="nice",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 4.81
lxd_cpu_seconds_total{cpu="0",mode="softirq",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 8.98
lxd_cpu_seconds_total{cpu="0",mode="steal",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 27.32
lxd_cpu_seconds_total{cpu="0",mode="system",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 91.47
lxd_cpu_seconds_total{cpu="0",mode="user",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 94.37
lxd_cpu_seconds_total{cpu="1",mode="iowait",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 186.47
lxd_cpu_seconds_total{cpu="1",mode="irq",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="1",mode="idle",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 9360.64
lxd_cpu_seconds_total{cpu="1",mode="nice",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 5.52
lxd_cpu_seconds_total{cpu="1",mode="softirq",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 10.6
lxd_cpu_seconds_total{cpu="1",mode="steal",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 27.46
lxd_cpu_seconds_total{cpu="1",mode="system",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 88.59
lxd_cpu_seconds_total{cpu="1",mode="user",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 85.41
lxd_cpu_seconds_total{cpu="0",mode="iowait",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 183.56
lxd_cpu_seconds_total{cpu="0",mode="irq",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="0",mode="idle",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 9222.8
lxd_cpu_seconds_total{cpu="0",mode="nice",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0.09
lxd_cpu_seconds_total{cpu="0",mode="softirq",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 13.65
lxd_cpu_seconds_total{cpu="0",mode="steal",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 33.91
lxd_cpu_seconds_total{cpu="0",mode="system",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 170.78
lxd_cpu_seconds_total{cpu="0",mode="user",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 137.95
lxd_cpu_seconds_total{cpu="1",mode="iowait",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 222.38
lxd_cpu_seconds_total{cpu="1",mode="irq",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_cpu_seconds_total{cpu="1",mode="idle",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 9193.42
lxd_cpu_seconds_total{cpu="1",mode="nice",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0.82
lxd_cpu_seconds_total{cpu="1",mode="softirq",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 14.63
lxd_cpu_seconds_total{cpu="1",mode="steal",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 33.55
lxd_cpu_seconds_total{cpu="1",mode="system",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 172.1
lxd_cpu_seconds_total{cpu="1",mode="user",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 123.06
lxd_disk_read_bytes_total{device="loop5",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 10240
lxd_disk_read_bytes_total{device="sda",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 7.17344768e+08
lxd_disk_read_bytes_total{device="sda1",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 6.95574016e+08
lxd_disk_read_bytes_total{device="loop1",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 11264
lxd_disk_read_bytes_total{device="loop2",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 2.54976e+06
lxd_disk_read_bytes_total{device="sda15",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 7.459328e+06
lxd_disk_read_bytes_total{device="loop4",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 11264
lxd_disk_read_bytes_total{device="loop6",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 25600
lxd_disk_read_bytes_total{device="loop3",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 3.8704128e+07
lxd_disk_read_bytes_total{device="loop7",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 274432
lxd_disk_read_bytes_total{device="loop8",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 7168
lxd_disk_read_bytes_total{device="loop9",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 3.7866496e+07
lxd_disk_read_bytes_total{device="sda14",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 278528
lxd_disk_read_bytes_total{device="loop0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.401856e+07
lxd_disk_read_bytes_total{device="loop10",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 14336
lxd_disk_read_bytes_total{device="loop5",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.5330304e+07
lxd_disk_read_bytes_total{device="loop8",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 3.3094656e+07
lxd_disk_read_bytes_total{device="sda14",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 352256
lxd_disk_read_bytes_total{device="sdb1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 7.197696e+06
lxd_disk_read_bytes_total{device="sdc",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 6.31062528e+08
lxd_disk_read_bytes_total{device="loop1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2.2365184e+07
lxd_disk_read_bytes_total{device="loop12",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 8.5085184e+07
lxd_disk_read_bytes_total{device="loop4",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 649216
lxd_disk_read_bytes_total{device="sda",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.937754112e+09
lxd_disk_read_bytes_total{device="sda15",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 8.477696e+06
lxd_disk_read_bytes_total{device="loop0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 4.8617472e+07
lxd_disk_read_bytes_total{device="loop3",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 664576
lxd_disk_read_bytes_total{device="loop14",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 14336
lxd_disk_read_bytes_total{device="loop6",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2.128896e+06
lxd_disk_read_bytes_total{device="loop9",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.72672e+08
lxd_disk_read_bytes_total{device="sda1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.914870784e+09
lxd_disk_read_bytes_total{device="loop10",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.826816e+06
lxd_disk_read_bytes_total{device="loop13",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 646144
lxd_disk_read_bytes_total{device="loop7",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 9.5623168e+07
lxd_disk_read_bytes_total{device="sdb",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 8.889344e+06
lxd_disk_read_bytes_total{device="sdb9",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 364544
lxd_disk_read_bytes_total{device="loop11",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.840128e+06
lxd_disk_read_bytes_total{device="loop2",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2.055168e+06
lxd_disk_read_bytes_total{device="loop13",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 9.2068864e+07
lxd_disk_read_bytes_total{device="loop4",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.081792e+06
lxd_disk_read_bytes_total{device="sdb",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 8.515072e+06
lxd_disk_read_bytes_total{device="sdb1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 6.823424e+06
lxd_disk_read_bytes_total{device="loop10",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 665600
lxd_disk_read_bytes_total{device="loop11",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 4.9344512e+07
lxd_disk_read_bytes_total{device="loop8",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.52539136e+08
lxd_disk_read_bytes_total{device="loop9",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.06667776e+08
lxd_disk_read_bytes_total{device="sda",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.746824704e+09
lxd_disk_read_bytes_total{device="sdb9",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 364544
lxd_disk_read_bytes_total{device="loop1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.116608e+06
lxd_disk_read_bytes_total{device="loop12",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 3.5378176e+07
lxd_disk_read_bytes_total{device="loop6",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.080768e+06
lxd_disk_read_bytes_total{device="rbd0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.757888e+08
lxd_disk_read_bytes_total{device="sda14",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 352256
lxd_disk_read_bytes_total{device="sdc",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 5.78064384e+08
lxd_disk_read_bytes_total{device="loop0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 653312
lxd_disk_read_bytes_total{device="loop14",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 14336
lxd_disk_read_bytes_total{device="loop2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 665600
lxd_disk_read_bytes_total{device="loop3",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.128896e+06
lxd_disk_read_bytes_total{device="loop5",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 5.348864e+07
lxd_disk_read_bytes_total{device="loop7",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.8408832e+07
lxd_disk_read_bytes_total{device="sda1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.725338112e+09
lxd_disk_read_bytes_total{device="sda15",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 7.08096e+06
lxd_disk_read_bytes_total{device="loop7",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.647616e+06
lxd_disk_read_bytes_total{device="loop8",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.110016e+06
lxd_disk_read_bytes_total{device="sdb",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.7160704e+08
lxd_disk_read_bytes_total{device="loop12",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 646144
lxd_disk_read_bytes_total{device="loop2",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 370688
lxd_disk_read_bytes_total{device="sda15",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 7.764992e+06
lxd_disk_read_bytes_total{device="sdb1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.69915392e+08
lxd_disk_read_bytes_total{device="sdb9",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 364544
lxd_disk_read_bytes_total{device="loop1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2.116608e+06
lxd_disk_read_bytes_total{device="loop10",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2.56069632e+08
lxd_disk_read_bytes_total{device="loop4",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 7.0250496e+07
lxd_disk_read_bytes_total{device="loop6",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 7.10762496e+08
lxd_disk_read_bytes_total{device="sda",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 6.15334144e+09
lxd_disk_read_bytes_total{device="sda14",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 352256
lxd_disk_read_bytes_total{device="loop0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 649216
lxd_disk_read_bytes_total{device="loop11",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2.68981248e+08
lxd_disk_read_bytes_total{device="loop3",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 5.3321728e+07
lxd_disk_read_bytes_total{device="loop5",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2.128896e+06
lxd_disk_read_bytes_total{device="loop9",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 9.77092608e+08
lxd_disk_read_bytes_total{device="sda1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 6.144216576e+09
lxd_disk_read_bytes_total{device="sdc",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.79728384e+08
lxd_disk_read_bytes_total{device="loop13",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.64596736e+08
lxd_disk_read_bytes_total{device="loop14",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 14336
lxd_disk_reads_completed_total{device="loop5",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9
lxd_disk_reads_completed_total{device="sda",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 15305
lxd_disk_reads_completed_total{device="sda1",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 14594
lxd_disk_reads_completed_total{device="loop1",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9
lxd_disk_reads_completed_total{device="loop2",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 362
lxd_disk_reads_completed_total{device="sda15",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 141
lxd_disk_reads_completed_total{device="loop4",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9
lxd_disk_reads_completed_total{device="loop6",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 16
lxd_disk_reads_completed_total{device="loop3",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1115
lxd_disk_reads_completed_total{device="loop7",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 17
lxd_disk_reads_completed_total{device="loop8",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 7
lxd_disk_reads_completed_total{device="loop9",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 964
lxd_disk_reads_completed_total{device="sda14",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 37
lxd_disk_reads_completed_total{device="loop0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 695
lxd_disk_reads_completed_total{device="loop10",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 11
lxd_disk_reads_completed_total{device="loop5",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 394
lxd_disk_reads_completed_total{device="loop8",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 724
lxd_disk_reads_completed_total{device="sda14",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 55
lxd_disk_reads_completed_total{device="sdb1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 482
lxd_disk_reads_completed_total{device="sdc",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 4593
lxd_disk_reads_completed_total{device="loop1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 982
lxd_disk_reads_completed_total{device="loop12",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1903
lxd_disk_reads_completed_total{device="loop4",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 65
lxd_disk_reads_completed_total{device="sda",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 39968
lxd_disk_reads_completed_total{device="sda15",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 179
lxd_disk_reads_completed_total{device="loop0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2687
lxd_disk_reads_completed_total{device="loop3",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 72
lxd_disk_reads_completed_total{device="loop14",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 11
lxd_disk_reads_completed_total{device="loop6",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 76
lxd_disk_reads_completed_total{device="loop9",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 4761
lxd_disk_reads_completed_total{device="sda1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 39199
lxd_disk_reads_completed_total{device="loop10",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 74
lxd_disk_reads_completed_total{device="loop13",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 63
lxd_disk_reads_completed_total{device="loop7",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2568
lxd_disk_reads_completed_total{device="sdb",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 607
lxd_disk_reads_completed_total{device="sdb9",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 58
lxd_disk_reads_completed_total{device="loop11",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 73
lxd_disk_reads_completed_total{device="loop2",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 78
lxd_disk_reads_completed_total{device="loop13",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2091
lxd_disk_reads_completed_total{device="loop4",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 77
lxd_disk_reads_completed_total{device="sdb",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 668
lxd_disk_reads_completed_total{device="sdb1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 543
lxd_disk_reads_completed_total{device="loop10",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 71
lxd_disk_reads_completed_total{device="loop11",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1069
lxd_disk_reads_completed_total{device="loop8",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 3983
lxd_disk_reads_completed_total{device="loop9",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 5632
lxd_disk_reads_completed_total{device="sda",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 57103
lxd_disk_reads_completed_total{device="sdb9",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 58
lxd_disk_reads_completed_total{device="loop1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 79
lxd_disk_reads_completed_total{device="loop12",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 863
lxd_disk_reads_completed_total{device="loop6",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 79
lxd_disk_reads_completed_total{device="rbd0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 9103
lxd_disk_reads_completed_total{device="sda14",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 55
lxd_disk_reads_completed_total{device="sdc",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 3419
lxd_disk_reads_completed_total{device="loop0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 66
lxd_disk_reads_completed_total{device="loop14",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 11
lxd_disk_reads_completed_total{device="loop2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 73
lxd_disk_reads_completed_total{device="loop3",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 76
lxd_disk_reads_completed_total{device="loop5",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2828
lxd_disk_reads_completed_total{device="loop7",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1148
lxd_disk_reads_completed_total{device="sda1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 56356
lxd_disk_reads_completed_total{device="sda15",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 157
lxd_disk_reads_completed_total{device="loop7",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 67
lxd_disk_reads_completed_total{device="loop8",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 59
lxd_disk_reads_completed_total{device="sdb",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 8621
lxd_disk_reads_completed_total{device="loop12",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 63
lxd_disk_reads_completed_total{device="loop2",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 51
lxd_disk_reads_completed_total{device="sda15",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 166
lxd_disk_reads_completed_total{device="sdb1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 8496
lxd_disk_reads_completed_total{device="sdb9",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 58
lxd_disk_reads_completed_total{device="loop1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 79
lxd_disk_reads_completed_total{device="loop10",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 5616
lxd_disk_reads_completed_total{device="loop4",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2844
lxd_disk_reads_completed_total{device="loop6",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 17671
lxd_disk_reads_completed_total{device="sda",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 105516
lxd_disk_reads_completed_total{device="sda14",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 55
lxd_disk_reads_completed_total{device="loop0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 65
lxd_disk_reads_completed_total{device="loop11",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 5690
lxd_disk_reads_completed_total{device="loop3",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1675
lxd_disk_reads_completed_total{device="loop5",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 76
lxd_disk_reads_completed_total{device="loop9",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 21351
lxd_disk_reads_completed_total{device="sda1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 105242
lxd_disk_reads_completed_total{device="sdc",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 5393
lxd_disk_reads_completed_total{device="loop13",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 3609
lxd_disk_reads_completed_total{device="loop14",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 11
lxd_disk_written_bytes_total{device="loop5",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 8.92773376e+08
lxd_disk_written_bytes_total{device="sda1",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 8.92772352e+08
lxd_disk_written_bytes_total{device="loop1",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop2",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda15",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1024
lxd_disk_written_bytes_total{device="loop4",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop6",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop3",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop7",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop8",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop9",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda14",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop10",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop5",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop8",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda14",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sdb1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2.304768e+07
lxd_disk_written_bytes_total{device="sdc",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 9.88430336e+08
lxd_disk_written_bytes_total{device="loop1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop12",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop4",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 6.306149376e+09
lxd_disk_written_bytes_total{device="sda15",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 5120
lxd_disk_written_bytes_total{device="loop0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop3",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop14",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop6",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop9",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 6.306144256e+09
lxd_disk_written_bytes_total{device="loop10",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop13",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop7",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sdb",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2.304768e+07
lxd_disk_written_bytes_total{device="sdb9",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop11",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop2",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop13",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop4",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sdb",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.2792192e+07
lxd_disk_written_bytes_total{device="sdb1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.2792192e+07
lxd_disk_written_bytes_total{device="loop10",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop11",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop8",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop9",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 6.286918656e+09
lxd_disk_written_bytes_total{device="sdb9",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop12",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop6",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="rbd0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.623488e+08
lxd_disk_written_bytes_total{device="sda14",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sdc",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 9.8854912e+08
lxd_disk_written_bytes_total{device="loop0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop14",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop3",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop5",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop7",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 6.286913536e+09
lxd_disk_written_bytes_total{device="sda15",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 5120
lxd_disk_written_bytes_total{device="loop7",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop8",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sdb",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2.6052096e+08
lxd_disk_written_bytes_total{device="loop12",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop2",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda15",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 5120
lxd_disk_written_bytes_total{device="sdb1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2.6052096e+08
lxd_disk_written_bytes_total{device="sdb9",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop10",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop4",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop6",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 5.613425664e+09
lxd_disk_written_bytes_total{device="sda14",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop11",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop3",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop5",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop9",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="sda1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 5.613420544e+09
lxd_disk_written_bytes_total{device="sdc",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.01214208e+09
lxd_disk_written_bytes_total{device="loop13",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_written_bytes_total{device="loop14",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop5",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 65660
lxd_disk_writes_completed_total{device="sda1",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 65658
lxd_disk_writes_completed_total{device="loop1",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop2",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda15",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 2
lxd_disk_writes_completed_total{device="loop4",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop6",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop3",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop7",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop8",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop9",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda14",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop10",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop5",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop8",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda14",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sdb1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2457
lxd_disk_writes_completed_total{device="sdc",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 56902
lxd_disk_writes_completed_total{device="loop1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop12",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop4",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 194356
lxd_disk_writes_completed_total{device="sda15",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 3
lxd_disk_writes_completed_total{device="loop0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop3",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop14",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop6",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop9",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 194353
lxd_disk_writes_completed_total{device="loop10",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop13",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop7",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sdb",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2457
lxd_disk_writes_completed_total{device="sdb9",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop11",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop2",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop13",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop4",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sdb",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2289
lxd_disk_writes_completed_total{device="sdb1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2289
lxd_disk_writes_completed_total{device="loop10",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop11",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop8",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop9",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 195815
lxd_disk_writes_completed_total{device="sdb9",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop12",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop6",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="rbd0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 10540
lxd_disk_writes_completed_total{device="sda14",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sdc",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 57023
lxd_disk_writes_completed_total{device="loop0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop14",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop3",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop5",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop7",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 195812
lxd_disk_writes_completed_total{device="sda15",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 3
lxd_disk_writes_completed_total{device="loop7",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop8",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sdb",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 38333
lxd_disk_writes_completed_total{device="loop12",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop2",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda15",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 3
lxd_disk_writes_completed_total{device="sdb1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 38333
lxd_disk_writes_completed_total{device="sdb9",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop10",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop4",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop6",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 173864
lxd_disk_writes_completed_total{device="sda14",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop11",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop3",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop5",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop9",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="sda1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 173861
lxd_disk_writes_completed_total{device="sdc",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 56622
lxd_disk_writes_completed_total{device="loop13",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_disk_writes_completed_total{device="loop14",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_avail_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 6.961278976e+09
lxd_filesystem_avail_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.03057408e+08
lxd_filesystem_avail_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_avail_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_avail_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 4.771274752e+09
lxd_filesystem_avail_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.03057408e+08
lxd_filesystem_avail_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_avail_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_avail_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 4.550201344e+09
lxd_filesystem_avail_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.03057408e+08
lxd_filesystem_avail_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_avail_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_avail_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 4.704854016e+09
lxd_filesystem_avail_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.03057408e+08
lxd_filesystem_avail_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_avail_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_free_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 6.978056192e+09
lxd_filesystem_free_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.03057408e+08
lxd_filesystem_free_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_free_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_free_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 4.788051968e+09
lxd_filesystem_free_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.03057408e+08
lxd_filesystem_free_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_free_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_free_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 4.56697856e+09
lxd_filesystem_free_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.03057408e+08
lxd_filesystem_free_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_free_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_free_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 4.721631232e+09
lxd_filesystem_free_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.03057408e+08
lxd_filesystem_free_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_free_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_size_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.0213466112e+10
lxd_filesystem_size_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.09395456e+08
lxd_filesystem_size_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_size_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_size_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.0213466112e+10
lxd_filesystem_size_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.09395456e+08
lxd_filesystem_size_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_size_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_size_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.0213466112e+10
lxd_filesystem_size_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.09395456e+08
lxd_filesystem_size_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_size_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_filesystem_size_bytes{device="/dev/root",fstype="ext4",mountpoint="/",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.0213466112e+10
lxd_filesystem_size_bytes{device="/dev/sda15",fstype="0x4d44",mountpoint="/boot/efi",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.09395456e+08
lxd_filesystem_size_bytes{device="none",fstype="0x-7a7ba70a",mountpoint="/run/credentials/systemd-sysusers.service",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_filesystem_size_bytes{device="tmpfs",fstype="tmpfs",mountpoint="/var/snap/lxd/common/ns",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.048576e+06
lxd_instances{project="microcloud-debug",type="container"} 0
lxd_instances{project="microcloud-debug",type="virtual-machine"} 1
lxd_instances{project="microcloud",type="container"} 0
lxd_instances{project="microcloud",type="virtual-machine"} 3
lxd_memory_Active_anon_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 679936
lxd_memory_Active_anon_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 3.198976e+06
lxd_memory_Active_anon_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.691648e+06
lxd_memory_Active_anon_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.896448e+06
lxd_memory_Active_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 3.73547008e+08
lxd_memory_Active_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.174528e+08
lxd_memory_Active_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.00081664e+08
lxd_memory_Active_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 5.3256192e+07
lxd_memory_Active_file_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 3.72867072e+08
lxd_memory_Active_file_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.14253824e+08
lxd_memory_Active_file_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 9.8390016e+07
lxd_memory_Active_file_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 5.1359744e+07
lxd_memory_Cached_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.04671232e+09
lxd_memory_Cached_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.82239232e+08
lxd_memory_Cached_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.77287168e+08
lxd_memory_Cached_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.40214272e+08
lxd_memory_Dirty_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 90112
lxd_memory_Dirty_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 237568
lxd_memory_Dirty_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 208896
lxd_memory_Dirty_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 229376
lxd_memory_HugepagesFree_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_memory_HugepagesFree_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_HugepagesFree_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_HugepagesFree_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_HugepagesTotal_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_memory_HugepagesTotal_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_HugepagesTotal_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_HugepagesTotal_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_Inactive_anon_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 2.87371264e+08
lxd_memory_Inactive_anon_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.523511296e+09
lxd_memory_Inactive_anon_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.560932352e+09
lxd_memory_Inactive_anon_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.620606976e+09
lxd_memory_Inactive_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 9.66275072e+08
lxd_memory_Inactive_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.63024896e+09
lxd_memory_Inactive_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.64626432e+09
lxd_memory_Inactive_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.67221248e+09
lxd_memory_Inactive_file_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 6.78903808e+08
lxd_memory_Inactive_file_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.06737664e+08
lxd_memory_Inactive_file_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 8.5331968e+07
lxd_memory_Inactive_file_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 5.1605504e+07
lxd_memory_Mapped_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.66940672e+08
lxd_memory_Mapped_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.18267904e+08
lxd_memory_Mapped_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.1433984e+08
lxd_memory_Mapped_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.14651136e+08
lxd_memory_MemAvailable_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 3.672240128e+09
lxd_memory_MemAvailable_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2.88854016e+08
lxd_memory_MemAvailable_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.33648128e+08
lxd_memory_MemAvailable_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.2890112e+08
lxd_memory_MemFree_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 2.591408128e+09
lxd_memory_MemFree_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 4.859904e+07
lxd_memory_MemFree_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 5.0266112e+07
lxd_memory_MemFree_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2.3523328e+07
lxd_memory_MemTotal_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 4.123549696e+09
lxd_memory_MemTotal_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 2.080452608e+09
lxd_memory_MemTotal_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.080456704e+09
lxd_memory_MemTotal_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2.080448512e+09
# HELP lxd_memory_OOM_kills_total The number of out of memory kills.
# TYPE lxd_memory_OOM_kills_total counter
lxd_memory_OOM_kills_total{name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_memory_OOM_kills_total{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_memory_OOM_kills_total{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_OOM_kills_total{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_OOM_kills_total{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_memory_RSS_bytes The amount of anonymous and swap cache memory.
# TYPE lxd_memory_RSS_bytes gauge
lxd_memory_RSS_bytes{name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_memory_RSS_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_memory_RSS_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_RSS_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_RSS_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_memory_Shmem_bytes The amount of cached filesystem data that is swap-backed.
# TYPE lxd_memory_Shmem_bytes gauge
lxd_memory_Shmem_bytes{name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 3.1567872e+07
lxd_memory_Shmem_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.411072e+07
lxd_memory_Shmem_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.4311424e+07
lxd_memory_Shmem_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.4557184e+07
lxd_memory_Shmem_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.4516224e+07
# HELP lxd_memory_Swap_bytes The amount of used swap memory.
# TYPE lxd_memory_Swap_bytes gauge
lxd_memory_Swap_bytes{name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_memory_Swap_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_memory_Swap_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_Swap_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_Swap_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_memory_Unevictable_bytes The amount of unevictable memory.
# TYPE lxd_memory_Unevictable_bytes gauge
lxd_memory_Unevictable_bytes{name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 8.224768e+06
lxd_memory_Unevictable_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 2.8450816e+07
lxd_memory_Unevictable_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 9.7480704e+07
lxd_memory_Unevictable_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 9.7492992e+07
lxd_memory_Unevictable_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 9.7726464e+07
# HELP lxd_memory_Writeback_bytes The amount of memory queued for syncing to disk.
# TYPE lxd_memory_Writeback_bytes gauge
lxd_memory_Writeback_bytes{name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_memory_Writeback_bytes{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_memory_Writeback_bytes{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 8192
lxd_memory_Writeback_bytes{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_memory_Writeback_bytes{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_network_receive_bytes_total The amount of received bytes on a given interface.
# TYPE lxd_network_receive_bytes_total counter
lxd_network_receive_bytes_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 1.215709e+06
lxd_network_receive_bytes_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 2610
lxd_network_receive_bytes_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 314407
lxd_network_receive_bytes_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 5.9542772e+07
lxd_network_receive_bytes_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="ovs-system",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="br-int",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="brdigy",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="enp5s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 7.65294028e+08
lxd_network_receive_bytes_total{device="enp6s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 82269
lxd_network_receive_bytes_total{device="genev_sys_6081",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.16402e+06
lxd_network_receive_bytes_total{device="lo",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 3.27919987e+08
lxd_network_receive_bytes_total{device="lxdovn1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="br-int",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="lxdovn1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="vethcfdf5fb2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 602
lxd_network_receive_bytes_total{device="ovs-system",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="brdigy",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="enp5s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 8.11514132e+08
lxd_network_receive_bytes_total{device="enp6s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 82689
lxd_network_receive_bytes_total{device="genev_sys_6081",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.19456e+06
lxd_network_receive_bytes_total{device="lo",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.63128246e+08
lxd_network_receive_bytes_total{device="ovs-system",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="enp5s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 9.56976454e+08
lxd_network_receive_bytes_total{device="lo",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2.67968459e+08
lxd_network_receive_bytes_total{device="enp6s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 82689
lxd_network_receive_bytes_total{device="genev_sys_6081",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.162756e+06
lxd_network_receive_bytes_total{device="lxdovn1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="vethf299f87c",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 42777
lxd_network_receive_bytes_total{device="br-int",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_bytes_total{device="brdigy",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_network_receive_drop_total The amount of received dropped bytes on a given interface.
# TYPE lxd_network_receive_drop_total counter
lxd_network_receive_drop_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="ovs-system",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="br-int",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="brdigy",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="enp5s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="enp6s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="genev_sys_6081",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lo",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lxdovn1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="br-int",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lxdovn1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="vethcfdf5fb2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="ovs-system",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="brdigy",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="enp5s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="enp6s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="genev_sys_6081",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lo",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="ovs-system",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="enp5s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lo",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="enp6s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="genev_sys_6081",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="lxdovn1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="vethf299f87c",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="br-int",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_drop_total{device="brdigy",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_network_receive_errs_total The amount of received errors on a given interface.
# TYPE lxd_network_receive_errs_total counter
lxd_network_receive_errs_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="ovs-system",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="br-int",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="brdigy",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="enp5s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="enp6s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="genev_sys_6081",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lo",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lxdovn1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="br-int",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lxdovn1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="vethcfdf5fb2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="ovs-system",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="brdigy",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="enp5s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="enp6s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="genev_sys_6081",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lo",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="ovs-system",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="enp5s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lo",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="enp6s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="genev_sys_6081",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="lxdovn1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="vethf299f87c",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="br-int",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_errs_total{device="brdigy",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_network_receive_packets_total The amount of received packets on a given interface.
# TYPE lxd_network_receive_packets_total counter
lxd_network_receive_packets_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 1776
lxd_network_receive_packets_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 24
lxd_network_receive_packets_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1255
lxd_network_receive_packets_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 338646
lxd_network_receive_packets_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="ovs-system",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="br-int",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="brdigy",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="enp5s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.013968e+06
lxd_network_receive_packets_total{device="enp6s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 389
lxd_network_receive_packets_total{device="genev_sys_6081",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 22385
lxd_network_receive_packets_total{device="lo",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 288194
lxd_network_receive_packets_total{device="lxdovn1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="br-int",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="lxdovn1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="vethcfdf5fb2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 7
lxd_network_receive_packets_total{device="ovs-system",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="brdigy",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="enp5s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 859844
lxd_network_receive_packets_total{device="enp6s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 399
lxd_network_receive_packets_total{device="genev_sys_6081",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 22772
lxd_network_receive_packets_total{device="lo",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 61219
lxd_network_receive_packets_total{device="ovs-system",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="enp5s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.334644e+06
lxd_network_receive_packets_total{device="lo",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 635015
lxd_network_receive_packets_total{device="enp6s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 399
lxd_network_receive_packets_total{device="genev_sys_6081",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 22358
lxd_network_receive_packets_total{device="lxdovn1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="vethf299f87c",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 459
lxd_network_receive_packets_total{device="br-int",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="brdigy",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_network_transmit_bytes_total The amount of transmitted bytes on a given interface.
# TYPE lxd_network_transmit_bytes_total counter
lxd_network_transmit_bytes_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 50338
lxd_network_transmit_bytes_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 2610
lxd_network_transmit_bytes_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 70432
lxd_network_transmit_bytes_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 5.9542772e+07
lxd_network_transmit_bytes_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 840
lxd_network_transmit_bytes_total{device="ovs-system",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="br-int",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="brdigy",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="enp5s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 8.200729e+08
lxd_network_transmit_bytes_total{device="enp6s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 640
lxd_network_transmit_bytes_total{device="genev_sys_6081",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.161992e+06
lxd_network_transmit_bytes_total{device="lo",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 3.27919987e+08
lxd_network_transmit_bytes_total{device="lxdovn1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="br-int",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="lxdovn1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="vethcfdf5fb2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 67870
lxd_network_transmit_bytes_total{device="ovs-system",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="brdigy",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="enp5s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 7.68479962e+08
lxd_network_transmit_bytes_total{device="enp6s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 220
lxd_network_transmit_bytes_total{device="genev_sys_6081",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 1.163588e+06
lxd_network_transmit_bytes_total{device="lo",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2.63128246e+08
lxd_network_transmit_bytes_total{device="ovs-system",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="enp5s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 9.44826708e+08
lxd_network_transmit_bytes_total{device="lo",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2.67968459e+08
lxd_network_transmit_bytes_total{device="enp6s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 220
lxd_network_transmit_bytes_total{device="genev_sys_6081",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.195964e+06
lxd_network_transmit_bytes_total{device="lxdovn1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="vethf299f87c",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 32554
lxd_network_transmit_bytes_total{device="br-int",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="brdigy",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_network_transmit_drop_total The amount of transmitted dropped bytes on a given interface.
# TYPE lxd_network_transmit_drop_total counter
lxd_network_transmit_drop_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="ovs-system",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="br-int",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="brdigy",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="enp5s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="enp6s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="genev_sys_6081",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lo",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lxdovn1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="br-int",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lxdovn1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="vethcfdf5fb2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="ovs-system",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="brdigy",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="enp5s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="enp6s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="genev_sys_6081",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lo",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="ovs-system",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="enp5s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lo",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="enp6s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="genev_sys_6081",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lxdovn1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="vethf299f87c",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="br-int",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="brdigy",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_network_transmit_errs_total The amount of transmitted errors on a given interface.
# TYPE lxd_network_transmit_errs_total counter
lxd_network_transmit_errs_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="ovs-system",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="br-int",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="brdigy",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="enp5s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="enp6s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="genev_sys_6081",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lo",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lxdovn1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="br-int",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lxdovn1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="vethcfdf5fb2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="ovs-system",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="brdigy",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="enp5s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="enp6s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="genev_sys_6081",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lo",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="ovs-system",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="enp5s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lo",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="enp6s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="genev_sys_6081",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lxdovn1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="vethf299f87c",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="br-int",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="brdigy",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_network_transmit_packets_total The amount of transmitted packets on a given interface.
# TYPE lxd_network_transmit_packets_total counter
lxd_network_transmit_packets_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 595
lxd_network_transmit_packets_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 24
lxd_network_transmit_packets_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 803
lxd_network_transmit_packets_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 338646
lxd_network_transmit_packets_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 12
lxd_network_transmit_packets_total{device="ovs-system",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="br-int",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="brdigy",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="enp5s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 1.019524e+06
lxd_network_transmit_packets_total{device="enp6s0",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 12
lxd_network_transmit_packets_total{device="genev_sys_6081",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 22346
lxd_network_transmit_packets_total{device="lo",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 288194
lxd_network_transmit_packets_total{device="lxdovn1",name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="br-int",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="lxdovn1",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="vethcfdf5fb2",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 649
lxd_network_transmit_packets_total{device="ovs-system",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="brdigy",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="enp5s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 871620
lxd_network_transmit_packets_total{device="enp6s0",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 2
lxd_network_transmit_packets_total{device="genev_sys_6081",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 22374
lxd_network_transmit_packets_total{device="lo",name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 61219
lxd_network_transmit_packets_total{device="ovs-system",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="enp5s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 1.315905e+06
lxd_network_transmit_packets_total{device="lo",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 635015
lxd_network_transmit_packets_total{device="enp6s0",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 2
lxd_network_transmit_packets_total{device="genev_sys_6081",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 22799
lxd_network_transmit_packets_total{device="lxdovn1",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="vethf299f87c",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 239
lxd_network_transmit_packets_total{device="br-int",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="brdigy",name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 0
# HELP lxd_operations_total The number of running operations
# TYPE lxd_operations_total counter
lxd_operations_total 0
# HELP lxd_procs_total The number of running processes.
# TYPE lxd_procs_total gauge
lxd_procs_total{name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 55
lxd_procs_total{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 26
lxd_procs_total{name="micro3",project="microcloud",state="RUNNING",type="virtual-machine"} 49
lxd_procs_total{name="micro2",project="microcloud",state="RUNNING",type="virtual-machine"} 72
lxd_procs_total{name="micro1",project="microcloud",state="RUNNING",type="virtual-machine"} 68
# EOF`;

const instanceMetrics = `
lxd_cpu_effective_total{name="hopeful-hound",project="default",type="container"} 12
lxd_cpu_seconds_total{cpu="0",mode="system",name="hopeful-hound",project="default",type="container"} 2.045652
lxd_cpu_seconds_total{cpu="0",mode="user",name="hopeful-hound",project="default",type="container"} 936.17924
lxd_disk_read_bytes_total{device="nvme0n1",name="hopeful-hound",project="default",type="container"} 909312
lxd_disk_read_bytes_total{device="loop18",name="hopeful-hound",project="default",type="container"} 0
lxd_disk_read_bytes_total{device="loop62",name="hopeful-hound",project="default",type="container"} 0
lxd_disk_reads_completed_total{device="nvme0n1",name="hopeful-hound",project="default",type="container"} 126
lxd_disk_reads_completed_total{device="loop18",name="hopeful-hound",project="default",type="container"} 0
lxd_disk_reads_completed_total{device="loop62",name="hopeful-hound",project="default",type="container"} 0
lxd_disk_written_bytes_total{device="nvme0n1",name="hopeful-hound",project="default",type="container"} 0
lxd_disk_written_bytes_total{device="loop18",name="hopeful-hound",project="default",type="container"} 0
lxd_disk_written_bytes_total{device="loop62",name="hopeful-hound",project="default",type="container"} 0
lxd_disk_writes_completed_total{device="nvme0n1",name="hopeful-hound",project="default",type="container"} 0
lxd_disk_writes_completed_total{device="loop18",name="hopeful-hound",project="default",type="container"} 0
lxd_disk_writes_completed_total{device="loop62",name="hopeful-hound",project="default",type="container"} 0
lxd_filesystem_avail_bytes{device="",fstype="zfs",mountpoint="/",name="hopeful-hound",project="default",type="container"} 2.71006957568e+11
lxd_filesystem_free_bytes{device="",fstype="zfs",mountpoint="/",name="hopeful-hound",project="default",type="container"} 2.71006957568e+11
lxd_filesystem_size_bytes{device="",fstype="zfs",mountpoint="/",name="hopeful-hound",project="default",type="container"} 4.136763392e+11
lxd_memory_Active_anon_bytes{name="hopeful-hound",project="default",type="container"} 3.3460224e+07
lxd_memory_Active_bytes{name="hopeful-hound",project="default",type="container"} 9.5744e+07
lxd_memory_Active_file_bytes{name="hopeful-hound",project="default",type="container"} 6.2283776e+07
lxd_memory_Cached_bytes{name="hopeful-hound",project="default",type="container"} 6.273024e+07
lxd_memory_Dirty_bytes{name="hopeful-hound",project="default",type="container"} 0
lxd_memory_Inactive_anon_bytes{name="hopeful-hound",project="default",type="container"} 53248
lxd_memory_Inactive_bytes{name="hopeful-hound",project="default",type="container"} 352256
lxd_memory_Inactive_file_bytes{name="hopeful-hound",project="default",type="container"} 299008
lxd_memory_Mapped_bytes{name="hopeful-hound",project="default",type="container"} 2.5665536e+07
lxd_memory_MemAvailable_bytes{name="hopeful-hound",project="default",type="container"} 5.0161557504e+10
lxd_memory_MemFree_bytes{name="hopeful-hound",project="default",type="container"} 5.0098827264e+10
lxd_memory_MemTotal_bytes{name="hopeful-hound",project="default",type="container"} 5.0209529856e+10
lxd_memory_OOM_kills_total{name="hopeful-hound",project="default",type="container"} 0
lxd_memory_Shmem_bytes{name="hopeful-hound",project="default",type="container"} 147456
lxd_memory_Swap_bytes{name="hopeful-hound",project="default",type="container"} 0
lxd_memory_Unevictable_bytes{name="hopeful-hound",project="default",type="container"} 0
lxd_memory_Writeback_bytes{name="hopeful-hound",project="default",type="container"} 0
lxd_network_receive_bytes_total{device="lo",name="hopeful-hound",project="default",type="container"} 7008
lxd_network_receive_drop_total{device="lo",name="hopeful-hound",project="default",type="container"} 0
lxd_network_receive_errs_total{device="lo",name="hopeful-hound",project="default",type="container"} 0
# HELP lxd_network_receive_packets_total The amount of received packets on a given interface.
# TYPE lxd_network_receive_packets_total counter
lxd_network_receive_packets_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_receive_packets_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 3925
lxd_network_receive_packets_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.137984e+06
lxd_network_receive_packets_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 2231
lxd_network_receive_packets_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 24
lxd_network_receive_packets_total{device="lo",name="hopeful-hound",project="default",type="container"} 96
# HELP lxd_network_transmit_bytes_total The amount of transmitted bytes on a given interface.
# TYPE lxd_network_transmit_bytes_total counter
lxd_network_transmit_bytes_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_bytes_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1260
lxd_network_transmit_bytes_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 176627
lxd_network_transmit_bytes_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.98112438e+08
lxd_network_transmit_bytes_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 58920
lxd_network_transmit_bytes_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 2610
lxd_network_transmit_bytes_total{device="lo",name="hopeful-hound",project="default",type="container"} 7008
# HELP lxd_network_transmit_drop_total The amount of transmitted dropped bytes on a given interface.
# TYPE lxd_network_transmit_drop_total counter
lxd_network_transmit_drop_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_drop_total{device="lo",name="hopeful-hound",project="default",type="container"} 0
# HELP lxd_network_transmit_errs_total The amount of transmitted errors on a given interface.
# TYPE lxd_network_transmit_errs_total counter
lxd_network_transmit_errs_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_errs_total{device="lo",name="hopeful-hound",project="default",type="container"} 0
# HELP lxd_network_transmit_packets_total The amount of transmitted packets on a given interface.
# TYPE lxd_network_transmit_packets_total counter
lxd_network_transmit_packets_total{device="lxdfan0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="lxdfan0-fan",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 0
lxd_network_transmit_packets_total{device="lxdfan0-mtu",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 18
lxd_network_transmit_packets_total{device="enp5s0",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 2312
lxd_network_transmit_packets_total{device="lo",name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 1.137984e+06
lxd_network_transmit_packets_total{device="eth0",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 738
lxd_network_transmit_packets_total{device="lo",name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 24
lxd_network_transmit_packets_total{device="lo",name="hopeful-hound",project="default",type="container"} 96
# HELP lxd_operations_total The number of running operations
# TYPE lxd_operations_total counter
lxd_operations_total 1
# HELP lxd_procs_total The number of running processes.
# TYPE lxd_procs_total gauge
lxd_procs_total{name="immortal-elf",project="microcloud-debug",state="RUNNING",type="virtual-machine"} 26
lxd_procs_total{name="raspberry-os",project="default",state="RUNNING",type="virtual-machine"} 56
lxd_procs_total{name="hopeful-hound",project="default",type="container"} 13
# HELP lxd_uptime_seconds The daemon uptime in seconds.
# TYPE lxd_uptime_seconds counter
lxd_uptime_seconds 32597.937262772
# HELP lxd_warnings_total The number of active warnings.
# TYPE lxd_warnings_total counter
lxd_warnings_total 1
# EOF`;
